// BioLinked Peptide Solutions — main site service worker
// Caches the landing page + key static assets so the site loads instantly on repeat visits.
const CACHE = 'biolinked-root-v1';
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

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  // Don't intercept anything under /<client-folder>/ — those have their own service workers
  const firstSeg = url.pathname.split('/').filter(Boolean)[0] || '';
  const CLIENT_DIRS = new Set(['jiis','cpeters','dmaynes','knelson','jholm','jdelorenzo','scastellanos','ahartman','aburr','bspeidell','cmaynes','cmyers','jmaynes','gpadilla','mpauldino']);
  if (CLIENT_DIRS.has(firstSeg)) return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      if (res && res.status === 200 && res.type === 'basic') {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match('/index.html')))
  );
});
