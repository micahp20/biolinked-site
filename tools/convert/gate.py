"""Per-page eligibility. A page converts only if everything it contains survives."""
import sys, re
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import extract as X, billing as B, assemble as A

MULTI_PROTOCOL = {'jmaynes', 'kdrieshman', 'knelson', 'dmaynes'}

def assess(slug, s):
    cmps = X.compounds(s)
    inv  = B.invoices(s)
    nts  = B.notes(s)
    src  = B.count_sources(s)
    rec  = B.reconcile(s, inv)
    try:
        labdata = A.labs(s)
        labn = sum(len(x['rows']) for x in labdata['secs']) if labdata else 0
        laberr = None
    except AssertionError as e:
        labdata, labn, laberr = None, 0, str(e)
    problems = []
    if slug in MULTI_PROTOCOL:
        problems.append('multi-protocol: needs the dropdown pattern')
    if laberr:
        problems.append(laberr)
    if not cmps and not labn and not inv:
        problems.append('no compounds, labs or invoices found')
    if rec['problems']:
        problems += ['money: ' + p for p in rec['problems']]
    if len(nts) < src['tipcards']:
        problems.append('notes: %d tip-cards in source, %d extracted' % (src['tipcards'], len(nts)))
    if any(c.get('cycle_ambiguous') for c in cmps):
        problems.append('cycle state ambiguous: cannot tell which cycle is current')
    nocad = [c['n'] for c in cmps if c.get('days') is None and c['cad'] not in ('PRN','EOD','WK')]
    if nocad:
        problems.append('schedule days unresolved: ' + ', '.join(nocad[:3]))
    return {'slug': slug, 'compounds': len(cmps), 'invoices': len(inv), 'notes': len(nts),
            'labmarkers': labn, 'cycles': len({c.get('cycle') for c in cmps if c.get('cycle')}),
            'trt': bool(re.search(r'testosterone|cypionate|\bTRT\b', ' '.join(c['n'] for c in cmps), re.I)),
            'ok': not problems, 'problems': problems}

def _cycles(cmps):
    return len({re.match(r'Cycle\s*\d+', c.get('tag') or '').group(0)
                for c in cmps if re.match(r'Cycle\s*\d+', c.get('tag') or '')})
