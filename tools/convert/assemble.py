"""Build an app-shell page for a client from their existing long-scroll page.

The shell, CSS and engine come from the template (a page already proven live).
Everything client-specific is read out of that client's own page: compounds,
invoices, bloodwork, notes, and the whole <head> identity block so their
sharing card and PWA name are unchanged.
"""
import re, json, html, sys
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import extract as X, billing as B

TEMPLATE = 'dcoone/index.html'
T_SLUG, T_FULL, T_FIRST = 'dcoone', 'David Coone', 'David'

# ---------- bloodwork: old markup -> the shell's LABS shape ----------
PILL = {'optimal': 'ok', 'good': 'ok', 'ok': 'ok', 'normal': 'normal',
        'watch': 'watch', 'lo': 'lo', 'low': 'lo', 'hi': 'hi', 'high': 'hi'}
PTS  = {'ok': 4, 'normal': 3, 'watch': 2, 'lo': 1, 'hi': 1}

def _bal(h, start, tag='div'):
    """(inner, end) for the element opening at start, matched by depth."""
    i = h.index('>', start) + 1
    depth = 1
    for m in re.finditer(r'<(/?)%s\b[^>]*>' % tag, h[i:]):
        depth += 1 if not m.group(1) else -1
        if depth == 0: return h[i:i + m.start()], i + m.end()
    return h[i:], len(h)


def labs(s):
    body = s[s.find('</style>'):]
    secs, vals = [], []
    si, spos = -1, 0
    while True:
        sm = re.search(r'<(div|details) class="[^"]*\blab-section\b[^"]*"[^>]*>', body[spos:])
        if not sm: break
        si += 1
        seg, spos = _bal(body, spos + sm.start(), sm.group(1))
        t = re.search(r'class="lab-section-title"[^>]*>(.*?)</div>', seg, re.S)
        rows = []
        ri, pos = -1, 0
        while True:
            m2 = re.search(r'<div class="lab-row"[^>]*>', seg[pos:])
            if not m2: break
            r, pos = _bal(seg, pos + m2.start())
            ri += 1
            # fields are spans on some pages and divs on others
            nm  = re.search(r'class="lab-name"[^>]*>(.*?)</(?:span|div)>\s*<(?:span|div) class="lab-val',
                            r + '<span class="lab-val', re.S)
            val = re.search(r'class="lab-val([^"]*)"[^>]*>(.*?)</(?:span|div)>', r, re.S)
            ref = re.search(r'class="lab-ref"[^>]*>(.*?)</(?:span|div)>', r, re.S)
            st  = re.search(r'class="lab-status ([^"]*)"[^>]*>(.*?)</(?:span|div)>', r, re.S)
            tip = re.search(r'class="info-tip-text">(.*?)</span></span>', r, re.S)
            if not nm or not val: continue
            raw = (st.group(1).strip().split() or [''])[0].lower() if st else 'normal'
            cls = PILL.get(raw, 'normal')
            vtxt = val.group(2)
            em = re.search(r'<em>(.*?)</em>', vtxt, re.S)
            rows.append({'id': 'bw%d_%d' % (si, ri),
                         'n': X._strip_tags_keep_tip(nm.group(1)),
                         'vc': cls, 'v': re.sub(r'<em>.*?</em>', '', vtxt, flags=re.S).strip(),
                         'u': em.group(1) if em else None,
                         'ref': X._txt(ref.group(1)) if ref else None,
                         'pc': cls, 'p': X._txt(st.group(2)) if st else None,
                         'tip': tip.group(1).strip() if tip else ''})
            vals.append(PTS.get(cls, 3))
        if rows: secs.append({'t': X._txt(t.group(1)) if t else 'Panel', 'rows': rows})
    src = len(re.findall(r'<div class="lab-row"', body))
    got = sum(len(x['rows']) for x in secs)
    if src != got:
        raise AssertionError('bloodwork: %d lab rows in source, %d extracted' % (src, got))
    if not secs: return None
    pct = round(100.0 * sum(vals) / (4 * len(vals)))
    label = ('Excellent' if pct >= 90 else 'Good' if pct >= 75 else
             'Fair' if pct >= 60 else 'Needs attention')
    n = sum(len(x['rows']) for x in secs)
    return {'sub': '%d markers across %d panel%s' % (n, len(secs), '' if len(secs) == 1 else 's'),
            'l': 'Overall Score', 'score': str(pct), 'outof': '/100',
            'g': label, 'c': None, 'domains': None,
            'bannerattr': '', 'banner': 'Tap any marker for what it means in plain language.',
            'secs': secs, 'note': None}

# ---------- compound -> shell rows ----------
def _clean(c):
    out = {k: c[k] for k in ('n', 'b', 'cad', 'c', 'd', 'u', 'rec', 'site', 'about', 'tag') if c.get(k) is not None}
    out.setdefault('b', 'AM'); out.setdefault('site', 'SubQ')
    if c.get('days') is not None: out['days'] = c['days']
    return out

def build(slug, old, full_name, first_name, template=None):
    tpl = template if template is not None else open(TEMPLATE, encoding='utf-8').read()
    cmps = X.compounds(old)
    inv  = B.invoices(old)
    nts  = B.notes(old)
    lab  = labs(old)

    cur = None
    cycles = {c.get('cycle'): c.get('cycle_state') for c in cmps if c.get('cycle')}
    if cycles:
        cur = next((k for k, v in cycles.items() if v == 'current'), None)
    active = [c for c in cmps if (c.get('cycle') == cur if cur else c.get('tag') != 'Archived')]
    ALL = [_clean(c) for c in cmps]
    CMP = [_clean(c) for c in active]
    paid = round(sum(o['total'] for o in inv if o['status'] == 'paid'), 2)
    due  = round(sum(o['total'] for o in inv if o['status'] == 'due'), 2)
    MINE = [{'name': c['n'].split(' · ')[0], 'cat': 'mine',
             'purpose': c.get('tag') or 'Active', 'vial': (c['n'].split(' · ')[1] if ' · ' in c['n'] else ''),
             'bac': c.get('rec') or '', 'dose': c.get('d') or '', 'units': (c.get('u') or '').rstrip('u')}
            for c in cmps]

    j = lambda o: json.dumps(o, ensure_ascii=False, separators=(',', ':'))
    out = tpl
    swaps = [
        (re.compile(r'var CMP=\[.*?\];', re.S),   'var CMP=' + j(CMP) + ';'),
        (re.compile(r'var ALL=\[.*?\];', re.S),   'var ALL=' + j(ALL) + ';'),
        (re.compile(r'var INV=\[.*?\];', re.S),   'var INV=' + j(inv) + ';'),
        (re.compile(r'var PAID=[\d.]+,DUE=[\d.]+;'), 'var PAID=%.1f,DUE=%.1f;' % (paid, due)),
        (re.compile(r'var NOTES=\[.*?\];', re.S), 'var NOTES=' + j(nts) + ';'),
        (re.compile(r'var MINE=\[.*?\];', re.S),  'var MINE=' + j(MINE) + ';'),
        (re.compile(r'var LABS=(?:null|\{.*?\});', re.S), 'var LABS=' + (j(lab) if lab else 'null') + ';'),
        (re.compile(r"var KP='[^']*';"),          "var KP='%s-app-';" % slug),
    ]
    for rx, rep in swaps:
        out, n = rx.subn(lambda m: rep, out, count=1)
        if n != 1: raise AssertionError('%s: data swap failed for %s' % (slug, rx.pattern[:28]))

    # identity: the client's own head stays theirs
    for pat, val in [(r'<title>[^<]*</title>', '<title>%s</title>' % _grab(old, r'<title>([^<]*)</title>', 'Your BioLinked Protocol')),
                     (r'(apple-mobile-web-app-title" content=")[^"]*', None)]:
        pass
    out = re.sub(r'<title>[^<]*</title>',
                 '<title>%s</title>' % _grab(old, r'<title>([^<]*)</title>', 'Your BioLinked Protocol'), out, count=1)
    out = re.sub(r'(apple-mobile-web-app-title" content=")[^"]*',
                 lambda m: m.group(1) + _grab(old, r'apple-mobile-web-app-title" content="([^"]*)', first_name), out, count=1)
    out = out.replace('/%s/manifest.json' % T_SLUG, '/%s/manifest.json' % slug)
    out = out.replace("'/%s/sw.js'" % T_SLUG, "'/%s/sw.js'" % slug)
    out = out.replace(T_FULL, full_name)
    out = re.sub(r"\b%s\b" % re.escape(T_FIRST), first_name, out)

    # Only meaningful for tokens that are not also this client's own.
    probes = []
    if first_name != T_FIRST and full_name != T_FULL: probes.append(r'\b%s\b' % re.escape(T_FIRST))
    if slug != T_SLUG: probes.append(re.escape(T_SLUG))
    leftovers = re.findall('|'.join(probes), out) if probes else []
    if leftovers: raise AssertionError('%s: template identity left behind: %s' % (slug, set(leftovers)))
    return out, {'compounds': len(ALL), 'active': len(CMP), 'invoices': len(inv),
                 'notes': len(nts), 'labmarkers': sum(len(x['rows']) for x in lab['secs']) if lab else 0,
                 'paid': paid, 'due': due, 'cycles': sorted(cycles) if cycles else [], 'current': cur}

def _grab(s, pat, dflt):
    m = re.search(pat, s)
    return m.group(1) if m else dflt
