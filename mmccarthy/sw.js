// BioLinked client protocol service worker — network-first so the protocol is
// never stale. Scoped to /mmccarthy/.
const CACHE = 'mmccarthy-v1009-wk1-dna1-sch1-days1-bac3-font1';
const ASSETS = [
  '/compound-library.js?v=2',
  '/mmccarthy/',
  '/mmccarthy/index.html',
  '/mmccarthy/manifest.json',
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
    keys.filter(k => k.startsWith('mmccarthy-') && k !== CACHE)
        .map(k => caches.delete(k))
  )));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (!url.pathname.startsWith('/mmccarthy/') && !url.pathname.startsWith('/icon-')) return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res && res.status === 200 && res.type === 'basic') {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('/mmccarthy/index.html')))
  );
});
