// Protocol by BioLinked — Service Worker
// Cache-first strategy for the app shell so the tracker works offline once installed.
const CACHE = 'mpauldino-v3';
const ASSETS = [
  '/mpauldino/',
  '/mpauldino/index.html',
  '/mpauldino/manifest.json',
  '/mpauldino/icon-180.png',
  '/mpauldino/icon-192.png',
  '/mpauldino/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Only handle GETs from our origin within /mpauldino/
  if (e.request.method !== 'GET') return;
  if (!url.pathname.startsWith('/mpauldino/')) return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      // Cache new same-origin responses
      if (res && res.status === 200 && res.type === 'basic') {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match('/mpauldino/index.html')))
  );
});
