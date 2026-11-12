// BioLinked client protocol service worker — network-first so the protocol is
// never stale. Scoped to /mpauldino/, which is now the real page: the app layout
// was promoted here from the /mpauldino/app/ pilot.
const CACHE = 'mpauldino-master-locked-v7-context-v1-controls-v1-consistency-v2-editor-v1-controls-repair-v1-calcact1-labs-nov2026-rescore4-bioage2';
const ASSETS = [
  '/calc-feedback.js?v=1',
  '/client-schedule-controls.css?v=1',
  '/mpauldino/protocol-layout.js?v=1',
  '/mpauldino/schedule-editor.js?v=2',
  '/mpauldino/protocol-consistency.css?v=2',
  '/protocol-copy.js?v=1',
  '/protocol-context.js?v=1',
  '/protocol-context.css?v=1',
  '/compound-library.js?v=2',
  '/bio-age.js?v=2',
  '/mpauldino/labs-nov2026.js?v=2',
  '/mpauldino/',
  '/mpauldino/index.html',
  '/mpauldino/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
  self.skipWaiting();
});

// Prune only this page's own caches, including the retired pilot's, so an
// installed copy of /mpauldino/app/ does not keep serving from its old store.
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => (k.startsWith('mpauldino-') || k.startsWith('mpauldino-app-')) && k !== CACHE)
        .map(k => caches.delete(k))
  )));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (!url.pathname.startsWith('/mpauldino/') && !url.pathname.startsWith('/icon-') && url.pathname !== '/calc-feedback.js' && url.pathname !== '/bio-age.js') return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res && res.status === 200 && res.type === 'basic') {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('/mpauldino/index.html')))
  );
});



