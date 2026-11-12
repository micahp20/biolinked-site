// BioLinked client protocol service worker — network-first so the protocol is
// never stale. Scoped to /losborne/.
const CACHE = 'losborne-master-sched1-v8-context-v1-controls-v1-calcact1-sgk1-extras1-dedupe1';
const ASSETS = [
  '/portal-extras.css?v=1',
  '/portal-extras.js?v=1',
  '/calc-feedback.js?v=1',
  '/protocol-copy.js?v=1',
  '/protocol-context.js?v=1',
  '/protocol-context.css?v=1',
  '/schedule-protocol-consistency.css?v=1',
  '/client-schedule-controls.css?v=1',
  '/schedule-engine.js?v=2',
  '/schedule-editor.js?v=1',
  '/compound-library.js?v=2',
  '/losborne/',
  '/losborne/index.html',
  '/losborne/manifest.json',
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
    keys.filter(k => k.startsWith('losborne-') && k !== CACHE)
        .map(k => caches.delete(k))
  )));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (!url.pathname.startsWith('/losborne/') && !url.pathname.startsWith('/icon-') && url.pathname !== '/calc-feedback.js') return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res && res.status === 200 && res.type === 'basic') {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('/losborne/index.html')))
  );
});