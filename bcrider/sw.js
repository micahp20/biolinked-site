// BioLinked client protocol service worker — network-first so the protocol is
// never stale. Scoped to /bcrider/, which is now the real page: the app layout
// was promoted here from the /bcrider/app/ pilot.
const CACHE = 'bcrider-mpauldino-layout-v1-20261123-nopriceBtns1';
const ASSETS = [
  '/portal-extras.css?v=1',
  '/calc-feedback.js?v=1',
  '/client-schedule-controls.css?v=1',
  '/bcrider/protocol-layout.js?v=1',
  '/bcrider/schedule-editor.js?v=3',
  '/bcrider/protocol-consistency.css?v=2',
  '/applepay.css?v=2',
  '/applepay.js?v=2',
  '/protocol-copy.js?v=2',
  '/protocol-context.js?v=1',
  '/protocol-context.css?v=1',
  '/compound-library.js?v=2',
  '/bio-age.js?v=2',
  '/bcrider/',
  '/bcrider/index.html',
  '/bcrider/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});

// Prune only this page's own caches, including the retired pilot's, so an
// installed copy of /bcrider/app/ does not keep serving from its old store.
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => (k.startsWith('bcrider-') || k.startsWith('bcrider-app-')) && k !== CACHE)
        .map(k => caches.delete(k))
  )));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (!url.pathname.startsWith('/bcrider/') && !url.pathname.startsWith('/icon-') && url.pathname !== '/calc-feedback.js' && url.pathname !== '/bio-age.js') return;
  e.respondWith(
    fetch(e.request, (e.request.mode === 'navigate' || (e.request.headers.get('accept') || '').includes('text/html')) ? { cache: 'no-store' } : undefined).then(res => {
      if (res && res.status === 200 && res.type === 'basic') {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('/bcrider/index.html')))
  );
});



