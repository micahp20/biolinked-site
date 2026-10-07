"""Turn the hand-written Labs markup on mpauldino into data + a renderer.

parse_block() reads the existing v-labs HTML into a LABS dict; render_block()
regenerates the markup from that dict. The two are verified byte-identical
before anything ships, so making Labs data-driven cannot change what a client
already sees.
"""
import re, json

def _balanced(h, start):
    """Return (inner, end) for the div opening at `start`, matching by depth."""
    i = h.index('>', start) + 1
    depth, j = 1, i
    for m in re.finditer(r'<(/?)div\b[^>]*>', h[i:]):
        depth += 1 if not m.group(1) else -1
        if depth == 0:
            j = i + m.start()
            return h[i:j], i + m.end()
    return h[i:], len(h)


def _find(h, cls):
    m = re.search(r'<div class="%s"[^>]*>' % cls, h)
    return _balanced(h, m.start()) if m else (None, None)


def parse_block(seg):
    labs = {}
    m = re.search(r'<p class="sub">(.*?)</p>', seg, re.S)
    labs['sub'] = m.group(1).strip() if m else ''

    body, _ = _find(seg, 'score')
    if body is not None:
        def g(c):
            v, _ = _find(body, c)
            return v.strip() if v is not None else None
        labs['l'] = g('l')
        n = re.search(r'<div class="n">(.*?)<small>(.*?)</small></div>', body, re.S)
        labs['score'] = n.group(1).strip() if n else ''
        labs['outof'] = n.group(2).strip() if n else '/100'
        labs['g'] = g('g'); labs['c'] = g('c')
        dg, _ = _find(body, 'dgrid')
        labs['domains'] = ([{'v': v.strip(), 'n': nm.strip()} for v, nm in
                            re.findall(r'<div class="dchip"><b>(.*?)</b>(.*?)</div>', dg, re.S)]
                           if dg is not None else None)

    bn = re.search(r'<div class="banner"([^>]*)><span class="d"></span>(.*?)</div>', seg, re.S)
    labs['bannerattr'] = bn.group(1) if bn else ''
    labs['banner'] = bn.group(2).strip() if bn else ''

    secs, pos = [], 0
    while True:
        sm = re.search(r'<div class="seclbl">(.*?)</div>', seg[pos:], re.S)
        if not sm: break
        title = sm.group(1).strip()
        lm = re.search(r'<div class="list"[^>]*>', seg[pos + sm.end():])
        if not lm: break
        body2, endp = _balanced(seg, pos + sm.end() + lm.start())
        rows, q = [], 0
        while True:
            rm = re.search(r'<div class="lrow" onclick="tt\(\'(.*?)\'\)">', body2[q:])
            if not rm: break
            inner, q2 = _balanced(body2, q + rm.start())
            rid = rm.group(1)
            lt, _ = _find(inner, 'lt')
            lm2 = re.search(r'<span class="ln">(.*?)</span>', lt or '', re.S)
            lv = re.search(r'<span class="lv([^"]*)">(.*?)(?:<em>(.*?)</em>)?</span>\s*$', (lt or '').strip(), re.S)
            meta, _ = _find(inner, 'lmeta')
            ref = re.search(r'<span class="lref">(.*?)</span>', meta or '', re.S)
            pill = re.search(r'<span class="pill([^"]*)">(.*?)</span>', meta or '', re.S)
            tip = re.search(r'<div class="ltip" id="%s">(.*?)</div>\s*$' % re.escape(rid), inner.strip(), re.S)
            rows.append({'id': rid,
                         'n': lm2.group(1) if lm2 else '',
                         'vc': (lv.group(1) or '').strip() if lv else '',
                         'v': lv.group(2) if lv else '',
                         'u': lv.group(3) if lv else None,
                         'ref': ref.group(1) if ref else None,
                         'pc': (pill.group(1) or '').strip() if pill else '',
                         'p': pill.group(2) if pill else None,
                         'tip': tip.group(1) if tip else ''})
            q = q2
        secs.append({'t': title, 'rows': rows})
        pos = endp
    labs['secs'] = secs
    nt = re.search(r'<p class="note">(.*?)</p>', seg, re.S)
    labs['note'] = nt.group(1).strip() if nt else None
    return labs


def render_block(labs):
    """Must byte-match the hand-written markup it was parsed from."""
    o = ['<h1 class="scrn">Labs</h1>', '<p class="sub">%s</p>' % labs['sub']]
    if labs.get('score'):
        o.append('<div class="score">')
        if labs.get('l') is not None: o.append('<div class="l">%s</div>' % labs['l'])
        o.append('<div class="n">%s<small>%s</small></div>' % (labs['score'], labs['outof']))
        if labs.get('g') is not None: o.append('<div class="g">%s</div>' % labs['g'])
        if labs.get('c') is not None: o.append('<div class="c">%s</div>' % labs['c'])
        if labs.get('domains') is not None:
            o.append('<div class="dgrid">' + ''.join(
                '<div class="dchip"><b>%s</b>%s</div>' % (d['v'], d['n']) for d in labs['domains']) + '</div>')
        o.append('</div>')
    o.append('<div class="banner"%s><span class="d"></span>%s</div>' % (labs.get('bannerattr', ''), labs['banner']))
    for s in labs['secs']:
        o.append('<div class="seclbl">%s</div>' % s['t'])
        o.append('<div class="list">')
        for r in s['rows']:
            em = '<em>%s</em>' % r['u'] if r['u'] is not None else ''
            pill = '<span class="pill%s">%s</span>' % (r['pc'] and ' ' + r['pc'], r['p']) if r['p'] is not None else ''
            ref = '<span class="lref">%s</span>' % r['ref'] if r['ref'] is not None else ''
            o.append('<div class="lrow" onclick="tt(\'%s\')"><div class="lt">'
                     '<span class="qm">?</span><span class="ln">%s</span>'
                     '<span class="lv%s">%s%s</span></div>'
                     '<div class="lmeta">%s%s</div>'
                     '<div class="ltip" id="%s">%s</div></div>'
                     % (r['id'], r['n'], r['vc'] and ' ' + r['vc'], r['v'], em,
                        ref, pill, r['id'], r['tip']))
        o.append('</div>')
    if labs.get('note') is not None:
        o.append('<p class="note">%s</p>' % labs['note'])
    return '\n'.join(o)


def norm(h):
    """Whitespace-insensitive comparison -- markup identity, not indentation."""
    return re.sub(r'>\s+<', '><', re.sub(r'\s+', ' ', h)).strip()
