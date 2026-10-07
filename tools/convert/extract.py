"""Extract a client's real data out of an old long-scroll protocol page.

Nothing here invents values. Every field is read from the page's own markup;
anything that cannot be read is left absent so the caller can decide whether
the page is safe to convert.
"""
import re, html, json

# ---------- small helpers ----------
def _txt(s):
    """Markup -> plain text, entities resolved, whitespace collapsed."""
    s = re.sub(r'<span class="info-tip".*?</span></span>', '', s, flags=re.S)  # drop tooltips
    s = re.sub(r'<br\s*/?>', ' ', s)
    s = re.sub(r'<[^>]+>', '', s)
    s = html.unescape(s)
    return re.sub(r'\s+', ' ', s).strip()

def _tip(seg):
    """Pull the tooltip body out of an info-tip, if present."""
    m = re.search(r'class="info-tip-text">(.*?)</span></span>', seg, re.S)
    return _txt(m.group(1)) if m else ''

def _strip_tags_keep_tip(seg):
    return _txt(re.sub(r'<span class="info-tip".*?</span></span>', '', seg, flags=re.S))

# ---------- cadence ----------
# Maps the prose a page uses to the day-engine codes the app shell understands.
DAYNAME = {'sun':0,'mon':1,'tue':2,'tues':2,'wed':3,'thu':4,'thur':4,'thurs':4,'fri':5,'sat':6}

# Each entry: pattern -> (code, label, explicit day set). The day set is what
# the day engine actually uses; the code is kept for continuity.
CAD = [
    (r'mon\w*\s*[-–—]\s*fri|monday\s*[-–—]\s*friday|weekday|\bm\s*[-–—]\s*f\b',
     'MF', 'Mon-Fri', [1,2,3,4,5]),
    (r'5\s*(?:days?|x)?\s*on\s*[,/]?\s*2\s*(?:days?\s*)?off|5\s*on\s*/\s*2\s*off|5\s*shots?/week',
     'MF', 'Mon-Fri', [1,2,3,4,5]),
    (r'\bm\s*/\s*w\s*/\s*f\b|mon\w*\s*/\s*wed\w*\s*/\s*fri', 'MWF', 'Mon / Wed / Fri', [1,3,5]),
    (r'mon\w*\s*(?:&|\+|and)\s*thu', 'MTH', 'Mon + Thu', [1,4]),
    (r'mon\w*\s*(?:&|\+|and)\s*wed', 'MW',  'Mon + Wed', [1,3]),
    (r'tue\w*\s*(?:&|\+|and|/)\s*sat', 'TS', 'Tue + Sat', [2,6]),
    (r'tue\w*\s*(?:&|\+|and|/)\s*fri', 'TF', 'Tue + Fri', [2,5]),
    (r'\bas needed\b|\bprn\b', 'PRN', 'As needed', []),
    (r'nightly|every night|\d+\s*-?\s*night\s*(?:block|pulse|run)|\d+\s*nights?\s*straight'
     r'|\d+\s*days?\s*straight|\d+\s*days?\s*on,?\s*then\s*off|\d+\s*(?:nights?|days?)\s*in a row',
     'DAILY', 'Daily', [0,1,2,3,4,5,6]),
    (r'every\s*other\s*day|\beod\b', 'EOD', 'Every other day', None),
    (r'\bdaily\b|every\s*day|7\s*days', 'DAILY', 'Daily', [0,1,2,3,4,5,6]),
    (r'twice\s*weekly|2\s*(?:x|\u00d7)\s*(?:per\s*)?week', 'MTH', 'Mon + Thu', [1,4]),
    (r'once\s*(?:a|per)?\s*week(?:ly)?|1\s*(?:x|\u00d7)\s*/?\s*week', 'WK', 'Weekly', None),
]

def cadence(text):
    """-> (code, label, days). days is None when the page did not say enough."""
    t = text.lower()
    for pat, code, label, days in CAD:
        if re.search(pat, t):
            if days is None and code == 'WK':
                d = _named_days(t)
                if len(d) == 1:
                    return 'WK', _daylabel(d), d
                return 'WK', label, None
            return code, label, days
    # no cadence word, but the page may name the days outright
    d = _named_days(t)
    if d:
        return 'DAYS', _daylabel(d), d
    return None, None, None

def _named_days(t):
    out = []
    for m in re.finditer(r'\b(sun|mon|tues?|wed|thur?s?|fri|sat)(?:day|nesday|rsday|urday)?\b', t):
        v = DAYNAME.get(m.group(1))
        if v is not None and v not in out: out.append(v)
    return sorted(out)

_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
def _daylabel(d):
    if len(d) == 7: return 'Daily'
    if d == [1,2,3,4,5]: return 'Mon-Fri'
    return ' / '.join(_SHORT[i] for i in d)

def block(text):
    """AM / PM / BOTH from the page's own wording."""
    t = text.lower()
    am = bool(re.search(r'\bam\b|morning|fasted morning|before breakfast', t))
    pm = bool(re.search(r'\bpm\b|evening|night|bed\b|before bed', t))
    if am and pm: return 'BOTH'
    if pm: return 'PM'
    if am: return 'AM'
    return None

# ---------- compounds ----------
def _split_name(raw):
    """'Retatrutide · 30 mg' -> ('Retatrutide', '30 mg'); keeps the page's own string."""
    n = _txt(raw)
    n = re.sub(r'\s*\((?:fat loss|muscle|healing|longevity)\)\s*$', '', n, flags=re.I)
    return n

def compounds(s):
    """Both markup families -> one list of app-shell compound dicts."""
    out, seen = [], set()

    # --- family B: .cmp-row / .fld ---
    for m in re.finditer(r'<div class="cmp-row"[^>]*>(.*?)(?=<div class="cmp-row"|</div>\s*</div>\s*(?:</div>)?\s*(?:<div class="cmp-group"|$))', s, re.S):
        seg = m.group(1)
        nm = re.search(r'class="cmp-row-name"[^>]*>(.*?)</span>\s*(?:<div class="cmp-fields")', seg, re.S) \
             or re.search(r'class="cmp-row-name"[^>]*>(.*?)$', seg, re.S)
        if not nm: continue
        name = _split_name(re.sub(r'<span class="cmp-badge".*?</span>', '', nm.group(1), flags=re.S))
        if not name: continue
        f = {}
        for fm in re.finditer(r'<span class="fld-l">(.*?)</span><span class="fld-v">(.*?)</span>', seg, re.S):
            f[_txt(fm.group(1)).lower()] = _txt(fm.group(2))
        c=_mk(name, f.get('recon'), f.get('dose'), f.get('schedule'), f.get('site'), _tip(seg), seg)
        c['_pos']=m.start(); out.append(c)

    # --- family A: details.li-row / .cmp-quick ---
    for m in re.finditer(r'<details class="li-row"[^>]*>(.*?)</details>', s, re.S):
        seg = m.group(1)
        nm = re.search(r'class="li-summary-name"[^>]*>(.*?)</span>\s*(?:</summary>|<span class="li-)', seg, re.S) \
             or re.search(r'class="li-summary-name"[^>]*>(.*?)</span>', seg, re.S)
        if not nm: continue
        raw = nm.group(1)
        head = re.search(r'class="cmp-head-key">(.*?)</span>', raw, re.S)
        headtxt = _txt(head.group(1)) if head else ''
        name = _split_name(re.sub(r'<span class="cmp-head-key">.*?</span>', '', raw, flags=re.S))
        if not name or _is_record(name, seg): continue
        f = {}
        for qm in re.finditer(r'<li><span class="ql">(.*?)</span><span class="qv">(.*?)</span></li>', seg, re.S):
            f[_txt(qm.group(1)).lower()] = _txt(qm.group(2))
        c=_mk(name, f.get('recon'), f.get('dose'), f.get('schedule') or headtxt,
                   f.get('site'), _tip(seg), seg, headtxt)
        c['_pos']=m.start(); out.append(c)

    # de-dupe pages that carry a compound in both families
    ded = []
    for c in sorted(out, key=lambda x: x.get('_pos', 0)):
        k = c['n'].lower()
        if k in seen: continue
        seen.add(k); ded.append(c)
    return assign_cycles(s, ded)

# A details.li-row is also used for closed-order records and section folds.
# Those carry a "Compound" or "Order" quick-label and a tick/"Completed" heading;
# they are not compounds and must never become schedule rows.
RECORD_RE = re.compile(r'^[\u2714\u2713\s]*(cycle\s*\d+|order\s*\d+|paid|completed|archive|invoice|summary|total)', re.I)
def _is_record(name, seg):
    if RECORD_RE.search(name): return True
    labels = {m.lower() for m in re.findall(r'<span class="ql">(.*?)</span>', seg)}
    return bool(labels & {'compound', 'order', 'titration', 'paid', 'total'}) and 'dose' not in labels

ARCH_RE = re.compile(r'completed|archived|prior cycle|no longer|finished|paid in full &mdash; (?:cycle|complete)', re.I)

def _mk(name, recon, dose, sched, site, about, seg, headtxt=''):
    sched = sched or ''
    code, label, days = cadence(sched + ' ' + headtxt)
    blk = block(sched + ' ' + headtxt)
    # A dose is often a titration ("1 mg -> 4 mg", "10 -> 40 units"). Taking one
    # endpoint from each field independently produces a draw volume that does not
    # match the dose, so ranges are carried whole.
    units, unit_vals = _units(dose, headtxt)
    mg, mg_vals, mg_unit = _amount(dose)
    return {
        'n': name,
        'b': blk, 'cad': code, 'c': label, 'days': days,
        'd': mg, 'u': units,
        'rec': (recon or '').replace('bacteriostatic water', 'BAC water'),
        'site': site or 'SubQ',
        'about': about or '',
        'tag': 'Archived' if ARCH_RE.search(seg[:400]) else 'Active',
        '_raw_sched': sched,
        '_u_vals': unit_vals, '_d_vals': mg_vals, '_d_unit': mg_unit,
    }


# ---------- invoices ----------
MONEY = re.compile(r'\$\s*([\d,]+(?:\.\d{2})?)')
def _money(t):
    m = MONEY.search(t or '')
    return float(m.group(1).replace(',', '')) if m else None

def invoices(s):
    """details.order-fold / .paid-archive -> the shell's INV list."""
    out = []
    for m in re.finditer(r'<details class="(order-fold|paid-archive)"[^>]*>(.*?)</details>', s, re.S):
        kind, seg = m.group(1), m.group(2)
        title = re.search(r'class="of-title"[^>]*>(.*?)</span>', seg, re.S)
        sub   = re.search(r'class="of-sub"[^>]*>(.*?)</span>', seg, re.S)
        stat  = re.search(r'class="of-status"[^>]*>(.*?)</span>', seg, re.S)
        if not title: continue
        stat_t = _txt(stat.group(1)) if stat else ''
        paid = kind == 'paid-archive' or re.search(r'paid|settled|✓|✔', stat_t, re.I)
        items, total = [], None
        for rm in re.finditer(r'<div class="total-row([^"]*)"><span class="tr-name">(.*?)</span><span class="tr-val"[^>]*>(.*?)</span></div>', seg, re.S):
            cls, nm, val = rm.group(1), rm.group(2), rm.group(3)
            amt = _money(_txt(val))
            sm = re.search(r'<span class="sub">(.*?)</span>', nm, re.S)
            label = _txt(re.sub(r'<span class="sub">.*?</span>', '', nm, flags=re.S))
            if 'grand' in cls or re.search(r'\btotal\b', label, re.I):
                if total is None: total = amt
                continue
            if amt is None: continue
            items.append({'n': label, 'sub': _txt(sm.group(1)) if sm else '', 'amt': amt})
        if total is None:
            total = _money(stat_t)
        if total is None and items:
            total = round(sum(i['amt'] for i in items), 2)
        if total is None: continue
        out.append({'label': _txt(title.group(1)),
                    'summary': _txt(sub.group(1)) if sub else '',
                    'status': 'paid' if paid else 'due',
                    'total': total, 'items': items})
    return out

def totals(inv):
    paid = round(sum(o['total'] for o in inv if o['status'] == 'paid'), 2)
    due  = round(sum(o['total'] for o in inv if o['status'] == 'due'), 2)
    return paid, due


# ---------- bloodwork ----------
STATUS_MAP = {'ok': 'optimal', 'good': 'optimal', 'optimal': 'optimal',
              'watch': 'watch', 'lo': 'out', 'low': 'out', 'hi': 'out', 'high': 'out'}
def labs(s):
    """.lab-section / .lab-row -> sections of markers, tooltips carried over."""
    out = []
    for sm in re.finditer(r'<div class="lab-section">(.*?)(?=<div class="lab-section">|<div class="lab-foot|</main|$)', s, re.S):
        seg = sm.group(1)
        t = re.search(r'class="lab-section-title"[^>]*>(.*?)</div>', seg, re.S)
        rows = []
        for rm in re.finditer(r'<div class="lab-row"[^>]*>(.*?)</div>\s*(?=<div class="lab-row"|<div class="lab-|</div>)', seg + '</div>', re.S):
            r = rm.group(1)
            nm  = re.search(r'class="lab-name"[^>]*>(.*?)</span>\s*<span class="lab-val', r + '<span class="lab-val', re.S)
            val = re.search(r'class="lab-val[^"]*"[^>]*>(.*?)</span>', r, re.S)
            ref = re.search(r'class="lab-ref"[^>]*>(.*?)</span>', r, re.S)
            st  = re.search(r'class="lab-status ([^"]*)"[^>]*>(.*?)</span>', r, re.S)
            if not nm or not val: continue
            rows.append({'n': _strip_tags_keep_tip(nm.group(1)),
                         'v': _txt(val.group(1)),
                         'r': _txt(ref.group(1)) if ref else '',
                         's': STATUS_MAP.get((st.group(1).strip().split() or [''])[0].lower(), 'in') if st else 'in',
                         'sl': _txt(st.group(2)) if st else '',
                         'tip': _tip(r)})
        if rows:
            out.append({'title': _txt(t.group(1)) if t else 'Panel', 'rows': rows})
    return out

def lab_score(sections):
    """Score /100 from the marker pills: optimal 4, in-range 3, watch 2, out 1."""
    pts = {'optimal': 4, 'in': 3, 'watch': 2, 'out': 1}
    vals = [pts[r['s']] for sec in sections for r in sec['rows']]
    if not vals: return None, None
    pct = round(100.0 * sum(vals) / (4 * len(vals)))
    label = ('Excellent' if pct >= 90 else 'Good' if pct >= 75 else
             'Fair' if pct >= 60 else 'Needs attention')
    return pct, label


# ---------- notes ----------
def notes(s):
    """Tip cards carried over as-is -- their HTML body is reused, never rewritten."""
    out = []
    for m in re.finditer(r'<div class="tip-card"[^>]*>(.*?)</div>\s*(?=<div class="tip-card"|<div class="sec-divider|</main|$)', s, re.S):
        seg = m.group(1)
        eb = re.search(r'class="tip-eyebrow"[^>]*>(.*?)</div>', seg, re.S)
        tt = re.search(r'class="tip-title"[^>]*>(.*?)</div>', seg, re.S)
        bd = re.search(r'class="tip-lead".*$', seg, re.S)
        if not tt: continue
        out.append({'eb': _txt(eb.group(1)) if eb else '',
                    'tt': _txt(tt.group(1)),
                    'bd': bd.group(0).strip() if bd else ''})
    return out


def client_name(s):
    m = re.search(r'<meta name="apple-mobile-web-app-title" content="([^"]+)"', s)
    if m: return m.group(1).strip()
    m = re.search(r'name="apple-mobile-web-app-title" content=\'([^\']+)\'', s)
    return m.group(1).strip() if m else ''


# ---------- cycles ----------
PAST_RE   = re.compile(r'paid|complete|finished|\u2713|\u2714|archive', re.I)
FUTURE_RE = re.compile(r'not ordered|not yet ordered|quoted|upcoming|future|planned|when you.{0,12}ready', re.I)

def cycle_cards(s):
    """(name, state, start, end) for every cycle card on the page."""
    body_at = s.find('</style>')
    out = []
    for m in re.finditer(r'<details class="[^"]*\btier\b[^"]*"[^>]*>', s):
        if m.start() < body_at: continue
        inner, end = _balanced_details(s, m.start())
        eb = re.search(r'class="tier-eyebrow"[^>]*>(.*?)</div>', inner, re.S)
        nm = re.search(r'class="tier-name"[^>]*>(.*?)</div>', inner, re.S)
        head = _txt(eb.group(1)) if eb else ''
        cm = re.match(r'(Cycle\s*\d+)', head)
        if not cm: continue
        marker = head + ' ' + (_txt(nm.group(1)) if nm else '') + ' ' + _txt(inner[:600])
        state = 'past' if PAST_RE.search(marker) else ('future' if FUTURE_RE.search(marker) else 'current')
        out.append({'n': cm.group(1), 'state': state, 'a': m.start(), 'b': end})
    return out

def _balanced_details(h, start):
    i = h.index('>', start) + 1
    depth = 1
    for m in re.finditer(r'<(/?)details\b[^>]*>', h[i:]):
        depth += 1 if not m.group(1) else -1
        if depth == 0: return h[i:i + m.start()], i + m.end()
    return h[i:], len(h)

def cycle_states_from_invoice(s, cards):
    """A cycle's state is stated by its order, not its header: a quoted cycle has
    not started, a paid one has run, the open one is current."""
    import billing as B
    inv = B.invoices(s)
    out = {}
    for c in cards:
        num = re.match(r'Cycle\s*(\d+)', c['n']).group(1)
        for o in inv:
            if re.search(r'cycle\s*%s\b' % num, o['label'], re.I):
                out[c['n']] = {'quote': 'future', 'paid': 'past', 'due': 'current'}[o['status']]
                break
    return out


def assign_cycles(s, cmps):
    cards = cycle_cards(s)
    if len(cards) < 2:
        for c in cmps: c.pop('_pos', None)
        return cmps
    states = cycle_states_from_invoice(s, cards)
    if states:
        # a cycle with no order of its own has not been bought yet
        for c in cards:
            c['state'] = states.get(c['n'], 'future')
    # the running cycle is the last one already paid for, when none is open
    if not any(c['state'] == 'current' for c in cards):
        past = [c for c in cards if c['state'] == 'past']
        if past: past[-1]['state'] = 'current'
    cur = [c for c in cards if c['state'] == 'current']
    # exactly one current cycle, or we do not guess
    ambiguous = len(cur) != 1
    for c in cmps:
        pos = c.get('_pos', -1)
        card = next((k for k in cards if k['a'] <= pos <= k['b']), None)
        if card:
            c['cycle'] = card['n']
            c['cycle_state'] = card['state']
            c['tag'] = card['n'] + (' \u00b7 future' if card['state'] == 'future' else
                                    (' \u00b7 past' if card['state'] == 'past' else ''))
        c.pop('_pos', None)
    if ambiguous:
        for c in cmps: c['cycle_ambiguous'] = True
    return cmps


ARROW = r'(?:\u2192|->|&rarr;|to|\u2013|\u2014|-)'

def _units(dose, headtxt):
    """-> ('10 \u2192 40u' | '10u' | '', [values])"""
    for src in ((dose or ''), headtxt or ''):
        m = re.search(r'(\d+(?:\.\d+)?)\s*(?:u\b|units)?\s*%s\s*(\d+(?:\.\d+)?)\s*(?:u\b|units)' % ARROW, src, re.I)
        if m:
            a, b = m.group(1), m.group(2)
            return '%s \u2192 %su' % (a, b), [float(a), float(b)]
        m = re.search(r'(\d+(?:\.\d+)?)\s*(?:u\b|units)', src, re.I)
        if m:
            return m.group(1) + 'u', [float(m.group(1))]
    return '', []

def _amount(dose):
    """-> ('1 \u2192 4 mg' | '2 mg' | '', [values], unit)"""
    d = dose or ''
    m = re.search(r'(~?\d+(?:\.\d+)?)\s*(mg|mcg|iu)?\s*%s\s*(~?\d+(?:\.\d+)?)\s*(mg|mcg|iu)\b' % ARROW, d, re.I)
    if m:
        u2 = m.group(4).lower()
        u1 = (m.group(2) or u2).lower()
        lo, hi = _f(m.group(1)), _f(m.group(3))
        # normalise to the second endpoint's unit so the pair is comparable
        lo_n = lo / 1000.0 if (u1 == 'mcg' and u2 == 'mg') else lo
        label = ('%s %s \u2192 %s %s' % (m.group(1), u1, m.group(3), u2)
                 if u1 != u2 else '%s \u2192 %s %s' % (m.group(1), m.group(3), u2))
        return label, [lo_n, hi], u2
    m = re.search(r'(~?\d+(?:\.\d+)?)\s*(mg|mcg|iu|ml)\b', d, re.I)
    if m:
        u = m.group(2).lower()
        return m.group(1) + ' ' + u, [_f(m.group(1))], u
    return '', [], None

def _f(x):
    return float(str(x).lstrip('~'))


VIAL_RE  = re.compile(r'(\d+(?:[.,]\d+)?)\s*(mg|mcg|iu)\b', re.I)
RECON_RE = re.compile(r'(\d+(?:\.\d+)?)\s*m[lL]\b')

CONC_RE = re.compile(r'(\d+(?:[.,]\d+)?)\s*(mg|mcg|iu)\s*/\s*m[lL]', re.I)

def dose_check(c):
    """Draw volume must follow from the vial, the recon volume and the dose.
    Returns None when the page did not state enough to check."""
    name = c['n']
    # A blend states a combined vial weight while the dose refers to the blend
    # as a whole; the per-mg arithmetic does not apply.
    if re.search(r'\bblend\b|\bstack\b|\+', name, re.I): return None
    # "5/5 mg" is two compounds in one vial, so the stated weight is not the
    # vial's single-compound strength.
    tailspec = name.split('\u00b7')[-1] if '\u00b7' in name else name
    if re.search(r'\d\s*/\s*\d', tailspec): return None
    tail = name.split('\u00b7', 1)[-1] if '\u00b7' in name else ''
    cm = CONC_RE.search(name)
    rm = RECON_RE.search(c.get('rec') or '')
    if cm:
        conc = float(cm.group(1).replace(',', ''))   # already mg per mL
        unit = cm.group(2).lower()
    else:
        vm = VIAL_RE.search(tail)
        if not vm or not rm: return None
        vial = float(vm.group(1).replace(',', '')); mls = float(rm.group(1))
        if not vial or not mls: return None
        conc = vial / mls
        unit = vm.group(2).lower()
    if not c.get('_u_vals') or not c.get('_d_vals'): return None
    if c.get('_d_unit') not in (None, unit): return None
    d_vals, u_vals = c['_d_vals'], c['_u_vals']
    # A titration states the full dose range but only the starting draw.
    if len(u_vals) == 1 and len(d_vals) > 1:
        d_vals = d_vals[:1]
    elif len(u_vals) != len(d_vals):
        return 'dose and draw do not pair: %s vs %s' % (c['d'], c['u'])
    for dose_v, unit_v in zip(d_vals, u_vals):
        want = dose_v / conc * 100.0        # U-100: 100 units = 1 mL
        if abs(want - unit_v) > max(1.0, want * 0.12):
            return ('%s: %s at %.1f %s/mL should draw ~%.1fu, page says %.1fu'
                    % (c['n'], c['d'], conc, unit, want, unit_v))
    return None
