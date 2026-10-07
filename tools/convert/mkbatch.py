"""Regenerate batch.json: every unconverted page that currently clears the gate."""
import sys, glob, json, re
sys.path.insert(0, 'tools/convert')
import gate
S = '/private/tmp/claude-501/-Users-micahp20-Dev-biolinked-site/57c3689d-fcd9-4de7-bb03-d3ab3f1a5156/scratchpad'
EX = {'annie-green','dford','dmiller','drew-holm','gaclient','jemery2','kyle-nelson','mmoorehead',
      'index','intake','share','product-line','protocols','ameris-daughter','renewal-year',
      'twelve-month','gorilla-stack-2'}
HOLD = {'dpacello-lcianciullo':'two people on one page',
        'pauldinos':'family page, not a single client',
        'thenry':'no compounds found',
        'vbernal-quintana':'hand-authored: Stripe link + custom nutrition the shell cannot hold'}
names = [c['name'] for c in json.load(open(S + '/clients.json'))]
def slugify(n):
    p = n.split(); return (p[0][0] + p[-1]).lower() if len(p) >= 2 else n.lower()
NAME = {slugify(n): n for n in names}

def name_for(slug, s):
    if slug in NAME: return NAME[slug]
    m = re.search(r'apple-mobile-web-app-title" content="([^"]*)', s)
    return (m.group(1).strip() if m else '')

if __name__ == '__main__':
    out, held, refused = [], [], []
    for f in sorted(glob.glob('*/index.html')):
        slug = f.split('/')[0]
        if slug in EX: continue
        s = open(f, encoding='utf-8', errors='replace').read()
        if 'id="labsbody"' in s and 'var CMP=' in s: continue      # already on the shell
        if slug in HOLD: held.append((slug, HOLD[slug])); continue
        g = gate.assess(slug, s)
        if not g['ok']: refused.append((slug, g['problems'])); continue
        full = name_for(slug, s)
        if not full: held.append((slug, 'no resolvable name')); continue
        out.append({'slug': slug, 'full': full, 'first': full.split()[0],
                    'cmp': g['compounds'], 'lab': g['labmarkers'],
                    'inv': g['invoices'], 'notes': g['notes'], 'cyc': g['cycles']})
    json.dump(out, open(S + '/batch.json', 'w'))
    json.dump(refused, open(S + '/refused.json', 'w'))
    print('eligible now: %d | held: %d | refused: %d' % (len(out), len(held), len(refused)))
    for s_, w in held: print('   HELD %-22s %s' % (s_, w))
