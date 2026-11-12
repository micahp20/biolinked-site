// BioLinked client protocol service worker — network-first so the protocol is
// never stale. Scoped to /thenry/.
const CACHE = 'thenry-order2-paid-v1-20261110-sgk1';
const ASSETS = [
  '/calc-feedback.js?v=1',
  '/protocol-copy.js?v=1',
  '/protocol-context.js?v=1',
  '/protocol-context.css?v=1',
  '/schedule-protocol-consistency.css?v=1',
  '/client-schedule-controls.css?v=1',
  '/schedule-engine.js?v=1',
  '/schedule-editor.js?v=1',
  '/compound-library.js?v=2',
  '/thenry/',
  '/thenry/index.html',
  '/thenry/manifest.json',
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
    keys.filter(k => k.startsWith('thenry-') && k !== CACHE)
        .map(k => caches.delete(k))
  )));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (!url.pathname.startsWith('/thenry/') && !url.pathname.startsWith('/icon-') && url.pathname !== '/calc-feedback.js') return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res && res.status === 200 && res.type === 'basic') {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('/thenry/index.html')))
  );
});