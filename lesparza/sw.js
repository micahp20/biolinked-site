// BioLinked client protocol service worker — network-first to serve fresh updates on every visit.
// Falls back to cache only when offline. Cache version bumped on each deploy to clear stale assets.
const CACHE = 'lesparza-v3';
const ASSETS = [
  '/lesparza/',
  '/lesparza/index.html',
  '/lesparza/manifest.json',
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

// Network-first: always try fresh content first so clients see the latest protocol updates.
// Falls back to cache only if the network is unavailable (offline support preserved).
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
    }).catch(() => caches.match(e.request).then(r => r || caches.match('/lesparza/index.html')))
  );
});
