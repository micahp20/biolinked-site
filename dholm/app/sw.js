// Retired. The pilot moved to /dholm/. This worker exists only to get out of
// the way: it caches nothing, serves everything straight from the network, and
// removes its own caches and registration on activation so an installed copy
// of the pilot cannot keep serving the old build.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('dholm-app-')).map(k => caches.delete(k)));
    await self.clients.claim();
    try { await self.registration.unregister(); } catch (_) {}
    const cs = await self.clients.matchAll({ type: 'window' });
    cs.forEach(c => { try { c.navigate('/dholm/'); } catch (_) {} });
  })());
});

// No caching at all — always the network, so nothing stale survives here.
self.addEventListener('fetch', () => {});
