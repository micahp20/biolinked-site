// BioLinked client protocol service worker — network-first so the protocol is
// never stale. Scoped to /lcianciullo/, which is now the real page: the app layout
// was promoted here from the /lcianciullo/app/ pilot.
const CACHE = 'lcianciullo-v8';
const ASSETS = [
  '/compound-library.js?v=2',
  '/lcianciullo/',
  '/lcianciullo/index.html',
  '/lcianciullo/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});

// Prune only this page's own caches, including the retired pilot's, so an
// installed copy of /lcianciullo/app/ does not keep serving from its old store.
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => (k.startsWith('dcoone-') || k.startsWith('dcoone-app-')) && k !== CACHE)
        .map(k => caches.delete(k))
  )));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (!url.pathname.startsWith('/lcianciullo/') && !url.pathname.startsWith('/icon-')) return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res && res.status === 200 && res.type === 'basic') {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('/lcianciullo/index.html')))
  );
});
