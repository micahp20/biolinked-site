// BioLinked app pilot service worker — network-first so the protocol is never stale.
// Falls back to cache only when offline. Scoped to /dholm/app/ so it cannot touch
// or shadow the live /dholm/ page, which has its own worker at /dholm/sw.js.
const CACHE = 'dholm-app-v14';
const ASSETS = [
  '/dholm/app/',
  '/dholm/app/index.html',
  '/dholm/app/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});

// Only ever prune this app's own caches — never dholm-v50, which belongs to the
// live protocol page and shares this origin's cache storage.
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k.startsWith('dholm-app-') && k !== CACHE).map(k => caches.delete(k))
  )));
  self.clients.claim();
});

// Network-first, and only for requests inside this app's own scope.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (!url.pathname.startsWith('/dholm/app/') && !url.pathname.startsWith('/icon-')) return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res && res.status === 200 && res.type === 'basic') {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('/dholm/app/index.html')))
  );
});
