"""Convert one wave. A page is written only if it clears every gate."""
import sys, re, json, subprocess, tempfile, os
sys.path.insert(0, 'tools/convert')
import assemble as A, gate, billing as B

S = '/private/tmp/claude-501/-Users-micahp20-Dev-biolinked-site/57c3689d-fcd9-4de7-bb03-d3ab3f1a5156/scratchpad'

def convert(e):
    slug = e['slug']
    old = open(slug + '/index.html', encoding='utf-8').read()
    g = gate.assess(slug, old)
    if not g['ok']:
        return None, 'gate: ' + '; '.join(g['problems'])[:140]
    try:
        page, st = A.build(slug, old, e['full'], e['first'])
    except AssertionError as err:
        return None, 'build refused: %s' % err

    blocks = re.findall(r'<script(?![^>]*src=)[^>]*>(.*?)</script>', page, re.S)
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f:
        f.write(max(blocks, key=len)); tmp = f.name
    r = subprocess.run(['node', '--check', tmp], capture_output=True, text=True); os.unlink(tmp)
    if r.returncode: return None, 'javascript does not parse: ' + r.stderr.strip()[:90]
    if page.count('<div') != page.count('</div>'): return None, 'div tags do not balance'
    if page.count('<section') != page.count('</section>'): return None, 'section tags do not balance'
    if 'function cycIsPast' not in page or 'function renderLabs' not in page:
        return None, 'template is missing a required function'

    srclab = len(re.findall(r'<div class="lab-row"', old[old.find('</style>'):]))
    if srclab != st['labmarkers']: return None, 'lab rows %d -> %d' % (srclab, st['labmarkers'])
    rec = B.reconcile(old, B.invoices(old))
    if not rec['ok']: return None, 'money: ' + '; '.join(rec['problems'])[:110]
    if st['compounds'] == 0 and st['labmarkers'] == 0: return None, 'nothing extracted'

    open(slug + '/index.html', 'w', encoding='utf-8').write(page)
    if not os.path.exists(slug + '/sw.js'):
        # the shell registers a worker, so a page that never had one gets the
        # template's, renamed to its own cache
        tpl = open('dcoone/sw.js', encoding='utf-8').read()
        open(slug + '/sw.js', 'w', encoding='utf-8').write(
            re.sub(r"CACHE *= *'dcoone-v\d+'", "CACHE = '%s-v1'" % slug, tpl).replace('/dcoone/', '/%s/' % slug))
    if not os.path.exists(slug + '/manifest.json') and os.path.exists('dcoone/manifest.json'):
        mf = open('dcoone/manifest.json', encoding='utf-8').read()
        open(slug + '/manifest.json', 'w', encoding='utf-8').write(mf.replace('/dcoone/', '/%s/' % slug))
    sw = open(slug + '/sw.js', encoding='utf-8').read()
    m = re.search(r"CACHE *= *'%s-v(\d+)'" % re.escape(slug), sw)
    if m:
        nv = '%s-v%d' % (slug, int(m.group(1)) + 1)
        open(slug + '/sw.js', 'w', encoding='utf-8').write(sw[:m.start()] + ("CACHE = '%s'" % nv) + sw[m.end():])
    else:
        nv = '(no sw cache line)'
    return dict(st, slug=slug, name=e['full'], sw=nv), None

if __name__ == '__main__':
    a, b = int(sys.argv[1]), int(sys.argv[2])
    batch = json.load(open(S + '/batch.json'))[a:b]
    done, failed = [], []
    for e in batch:
        got, why = convert(e)
        if got:
            done.append(got)
            print('  OK   %-20s %-22s cmp %2d/%-2d inv %d notes %2d labs %2d  %s'
                  % (e['slug'], e['full'][:22], got['active'], got['compounds'],
                     got['invoices'], got['notes'], got['labmarkers'], got['sw']))
        else:
            failed.append((e['slug'], why))
            print('  SKIP %-20s %s' % (e['slug'], why))
    prev = json.load(open(S + '/done.json')) if os.path.exists(S + '/done.json') else []
    json.dump(prev + done, open(S + '/done.json', 'w'))
    pf = json.load(open(S + '/failed.json')) if os.path.exists(S + '/failed.json') else []
    json.dump(pf + failed, open(S + '/failed.json', 'w'))
    print('\nwave: %d converted, %d skipped' % (len(done), len(failed)))
