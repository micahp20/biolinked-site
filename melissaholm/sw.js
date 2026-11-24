// BioLinked client protocol service worker — network-first so the protocol is
// never stale. Scoped to /melissaholm/.
const CACHE = 'melissaholm-protocol-v1-20261124';
const ASSETS = [
  '/portal-extras.css?v=1',
  '/portal-extras.js?v=1',
  '/bio-age.js?v=2',
  '/calc-feedback.js?v=1',
  '/melissaholm/protocol-copy.js?v=1',
  '/protocol-context.js?v=1',
  '/protocol-context.css?v=1',
  '/schedule-protocol-consistency.css?v=1',
  '/client-schedule-controls.css?v=melissaholm-3',
  '/schedule-engine.js?v=melissaholm-7',
  '/schedule-editor.js?v=melissaholm-5',
  '/melissaholm/compound-library.js?v=1',
  '/melissaholm/',
  '/melissaholm/index.html',
  '/melissaholm/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});

// Prune only this page's own caches.
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k.startsWith('melissaholm-') && k !== CACHE)
        .map(k => caches.delete(k))
  )));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (!url.pathname.startsWith('/melissaholm/') && !url.pathname.startsWith('/icon-') && url.pathname !== '/calc-feedback.js' && url.pathname !== '/bio-age.js') return;
  e.respondWith(
    fetch(e.request, (e.request.mode === 'navigate' || (e.request.headers.get('accept') || '').includes('text/html')) ? { cache: 'no-store' } : undefined).then(res => {
      if (res && res.status === 200 && res.type === 'basic') {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('/melissaholm/index.html')))
  );
});