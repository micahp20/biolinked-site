"""Invoices and notes, with a reconciliation gate.

The corpus uses several markup shapes for the same thing. Everything here is
tolerant of that, and nothing is emitted on trust: reconcile() re-reads the
figures the page states in its own words (Balance Due, Account Total, Paid to
Date) and compares them to what was extracted. A page that does not reconcile
is refused rather than converted.
"""
import re, html

def _txt(s):
    s = re.sub(r'<span class="info-tip".*?</span></span>', '', s or '', flags=re.S)
    s = re.sub(r'<[^>]+>', ' ', s)
    return re.sub(r'\s+', ' ', html.unescape(s)).strip()

MONEY = re.compile(r'\$\s*(-?[\d,]+(?:\.\d{1,2})?)')
def money(t):
    m = MONEY.search(t or '')
    return float(m.group(1).replace(',', '')) if m else None

def _balanced(h, start, tag):
    """(inner, end) for the <tag> opening at start, matched by depth."""
    i = h.index('>', start) + 1
    depth = 1
    for m in re.finditer(r'<(/?)%s\b[^>]*>' % tag, h[i:]):
        depth += 1 if not m.group(1) else -1
        if depth == 0:
            return h[i:i + m.start()], i + m.end()
    return h[i:], len(h)

TOTAL_WORDS = re.compile(r'\b(total|balance|due|subtotal|paid in full|grand)\b', re.I)

DISCOUNT = re.compile(r'discount|savings|saved|friends\s*&?\s*family|f&f|credit|adjustment', re.I)
MINUS = re.compile(r'&minus;|\u2212|-\s*\$|\(\s*\$')

def _rows(seg):
    """Both .total-row shapes -> (items, total).

    An order that carries a discount states an MSRP subtotal, the discount, and
    then the amount actually charged. The charged amount is the one in the
    `grand` row, so that row wins; any other total-looking row is only a
    fallback."""
    items, total, fallback = [], None, None
    for m in re.finditer(r'<div class="total-row([^"]*)"[^>]*>(.*?)</div>\s*(?=<div class="total-row|</div>|$)', seg, re.S):
        cls, inner = m.group(1), m.group(2)
        # shape A: .tr-name / .tr-val   shape B: <span>label</span><span class="val">
        nm = re.search(r'<span class="tr-name">(.*?)</span>\s*<span class="tr-val"[^>]*>(.*?)</span>', inner, re.S)
        if nm:
            label_html, val = nm.group(1), nm.group(2)
        else:
            # shape B has <span class="val">, shape C has a bare second span
            nb = (re.search(r'<span[^>]*>(.*?)</span>\s*<span class="val"[^>]*>(.*?)</span>', inner, re.S)
                  or re.fullmatch(r'\s*<span[^>]*>(.*?)</span>\s*<span[^>]*>([^<]*\$[^<]*)</span>\s*', inner, re.S))
            if not nb: continue
            label_html, val = nb.group(1), nb.group(2)
        amt = money(_txt(val))
        if amt is None: continue
        sub = re.search(r'<span class="sub">(.*?)</span>', label_html, re.S)
        label = _txt(re.sub(r'<span class="sub">.*?</span>', '', label_html, flags=re.S))
        if 'grand' in cls:
            if total is None: total = amt
            continue
        if TOTAL_WORDS.search(label):
            if fallback is None: fallback = amt
            continue
        if DISCOUNT.search(label) and MINUS.search(val):
            amt = -abs(amt)
        items.append({'n': label, 'sub': _txt(sub.group(1)) if sub else '', 'amt': amt})
    return items, (total if total is not None else fallback)

ORDER_CLASSES = ('order-fold', 'paid-archive', 'tier')

# Some pages show one order twice: an itemised breakdown and a summary. The
# breakdown is a view of the same money, not a second order.
VIEW_OF_ANOTHER = re.compile(r'itemi[sz]ed|per compound|breakdown|line items?\b', re.I)

def invoices(s):
    body = s[s.find('</style>'):]
    out = []
    for cls in ORDER_CLASSES:
        pos = 0
        while True:
            m = re.search(r'<details class="[^"]*\b%s\b[^"]*"[^>]*>' % cls, body[pos:])
            if not m: break
            inner, end = _balanced(body, pos + m.start(), 'details')
            pos = pos + m.start() + (end - (pos + m.start()))
            # title / status
            t = (re.search(r'class="of-title"[^>]*>(.*?)</span>', inner, re.S)
                 or re.search(r'class="tier-name"[^>]*>(.*?)</span>', inner, re.S)
                 or re.search(r'<summary[^>]*>(.*?)</summary>', inner, re.S))
            sub = re.search(r'class="of-sub"[^>]*>(.*?)</span>', inner, re.S)
            st = re.search(r'class="of-status"[^>]*>(.*?)</span>', inner, re.S)
            items, total = _rows(inner)
            if total is None and not items:
                continue
            if VIEW_OF_ANOTHER.search(_txt(t.group(1)) if t else ''):
                continue
            stat_t = _txt(st.group(1)) if st else ''
            head = _txt(t.group(1)) if t else ''
            # A quoted / not-yet-ordered cycle is shown for planning and is
            # deliberately outside the account total.
            blob = head + ' ' + stat_t + ' ' + _txt(re.search(r'<summary[^>]*>(.*?)</summary>', inner, re.S).group(1) if re.search(r'<summary[^>]*>(.*?)</summary>', inner, re.S) else '')
            quoted = re.search(r'not ordered|not yet ordered|quote|planned|declined|not billed|proposed', blob, re.I)
            # What the order says it IS outranks a loose word in its summary:
            # an explicit Paid tick or a Due status settles it either way.
            paid_marker = re.search(r'[\u2713\u2714]\s*paid|paid in full|\bsettled\b', blob, re.I)
            due_marker  = re.search(r'\bdue\b', stat_t + ' ' + head, re.I)
            if paid_marker or due_marker:
                quoted = None
            paid = (cls == 'paid-archive'
                    or re.search(r'paid|settled|✓|✔|complete', stat_t, re.I)
                    or re.search(r'paid in full|✔\s*cycle', _txt(t.group(1) if t else ''), re.I))
            if not total:
                pa = re.search(r'class="pa-sub"[^>]*>(.*?)</span>', inner, re.S)
                total = money(_txt(pa.group(1))) if pa else None
            if not total:
                total = round(sum(i['amt'] for i in items), 2)
            out.append({'label': _txt(t.group(1))[:90] if t else 'Order',
                        'summary': _txt(sub.group(1)) if sub else stat_t,
                        'status': 'quote' if quoted else ('paid' if paid else 'due'),
                        'total': total, 'items': items})
    return out

STATED = {
    'balance': re.compile(r'Balance Due.{0,160}?\$\s*(-?[\d,]+(?:\.\d{1,2})?)', re.S | re.I),
    'account': re.compile(r'Account Total.{0,160}?\$\s*(-?[\d,]+(?:\.\d{1,2})?)', re.S | re.I),
    'paid':    re.compile(r'Paid to Date.{0,160}?\$\s*(-?[\d,]+(?:\.\d{1,2})?)', re.S | re.I),
}
def stated_figures(s):
    body = s[s.find('</style>'):]
    out = {}
    for k, rx in STATED.items():
        m = rx.search(body)
        out[k] = float(m.group(1).replace(',', '')) if m else None
    return out


def notes(s):
    """details.tip-card and the older div.tip-card, body carried over verbatim."""
    body = s[s.find('</style>'):]
    out = []
    for tag, cls in (('details', 'tip-card'), ('div', 'tip-card')):
        pos = 0
        while True:
            m = re.search(r'<%s class="[^"]*\b%s\b[^"]*"[^>]*>' % (tag, cls), body[pos:])
            if not m: break
            start = pos + m.start()
            inner, end = _balanced(body, start, tag)
            pos = end
            eb = re.search(r'class="tip-eyebrow"[^>]*>(.*?)</div>', inner, re.S)
            tt = re.search(r'class="tip-title"[^>]*>(.*?)</div>', inner, re.S)
            if not tt:
                # Some cards carry no title of their own; the page titles them
                # with the section divider immediately above.
                pre = body[max(0, start - 600):start]
                dv = list(re.finditer(r'class="(?:sec-divider-title|cmp-group[^"]*)"[^>]*>(.*?)</div>', pre, re.S))
                de = list(re.finditer(r'class="sec-divider-eyebrow"[^>]*>(.*?)</div>', pre, re.S))
                if not dv: continue
                tt = dv[-1]
                if de and not eb: eb = de[-1]
            bm = re.search(r'<div class="tip-body"[^>]*>', inner)
            if bm:
                body_html, _ = _balanced(inner, bm.start(), 'div')
            else:
                lm = re.search(r'<div class="tip-lead"[^>]*>', inner)
                body_html = inner[lm.start():] if lm else ''
            body_html = body_html.strip()
            # never emit a fragment that does not close itself
            if body_html.count('<div') != body_html.count('</div>'):
                body_html = ''
            out.append({'eb': _txt(eb.group(1)) if eb else '',
                        'tt': _txt(tt.group(1)),
                        'bd': body_html})
    # de-dupe: a <div class="tip-card"> nested inside a <details class="tip-card">
    # would otherwise be collected twice
    seen, uniq = set(), []
    for n in out:
        k = (n['tt'], n['eb'])
        if k in seen: continue
        seen.add(k); uniq.append(n)
    out = uniq
    return out

def count_sources(s):
    """What the page actually contains, for the drop-nothing assertion."""
    body = s[s.find('</style>'):]
    return {'tipcards': len(re.findall(r'<details class="[^"]*tip-card|<div class="tip-card', body)),
            'orders': sum(len(re.findall(r'<details class="[^"]*\b%s\b' % c, body)) for c in ORDER_CLASSES)}


def reconcile(s, inv):
    """Compare extracted money against the figures the page states itself."""
    f = stated_figures(s)
    got_due = round(sum(o['total'] for o in inv if o['status'] == 'due'), 2)
    got_paid = round(sum(o['total'] for o in inv if o['status'] == 'paid'), 2)
    got_quote = round(sum(o['total'] for o in inv if o['status'] == 'quote'), 2)
    got_all = round(got_due + got_paid, 2)
    problems = []
    def near(a, b): return a is not None and b is not None and abs(a - b) < 0.01
    if f['balance'] is not None and not near(f['balance'], got_due):
        problems.append('balance due: page says $%.2f, extracted $%.2f' % (f['balance'], got_due))
    bal_ok  = f['balance'] is None or near(f['balance'], got_due)
    paid_ok = f['paid'] is None or near(f['paid'], got_paid)
    # Balance Due and Paid to Date are the authoritative pair. "Account Total"
    # also matches prose elsewhere on a page, so it is only trusted when the
    # other two are absent or already disagree.
    if (f['account'] is not None and not near(f['account'], got_all)
            and not (bal_ok and paid_ok and f['balance'] is not None and f['paid'] is not None)):
        problems.append('account total: page says $%.2f, extracted $%.2f' % (f['account'], got_all))
    if f['paid'] is not None and not near(f['paid'], got_paid):
        problems.append('paid to date: page says $%.2f, extracted $%.2f' % (f['paid'], got_paid))
    return {'stated': f, 'got': {'due': got_due, 'paid': got_paid, 'all': got_all, 'quoted': got_quote},
            'problems': problems, 'ok': not problems}
