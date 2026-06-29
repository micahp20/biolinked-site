// BioLinked Peptide Solutions — main site service worker.
// Network-first strategy: always serves fresh content when online, falls back to cache when offline.
// Each client folder also has its own service worker scoped to that path (which will take over within its scope).
const CACHE = 'biolinked-root-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
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
    keys.filter(k => k.startsWith('biolinked-root-') && k !== CACHE).map(k => caches.delete(k))
  )));
  self.clients.claim();
});

// Network-first: always try the network so visitors see the latest content.
// Falls back to cache only if the network is unavailable.
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
    }).catch(() => caches.match(e.request).then(r => r || caches.match('/index.html')))
  );
});
