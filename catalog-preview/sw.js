// BioLinked catalog preview service worker — network-first so data edits to
// /cheat-sheet-data.js show up on the next visit. Cache is offline fallback only.
const CACHE = 'catalog-preview-v1';
const ASSETS = [
  '/catalog-preview/',
  '/catalog-preview/index.html',
  '/catalog-preview/manifest.json',
  '/cheat-sheet-data.js',
  '/icon-180.png',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k !== CACHE).map(k => caches.delete(k))
  )));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res && res.status === 200 && res.type === 'basic') {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('/catalog-preview/index.html')))
  );
});
