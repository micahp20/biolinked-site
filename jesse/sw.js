// Retired scope. /jesse/ moved to /jbrown/ — this worker exists only so already
// installed clients get an update that unregisters them and drops the old cache,
// instead of a 404 leaving a stale worker serving the old page indefinitely.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('jesse-')).map(k => caches.delete(k)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: 'window' });
    for (const c of clients) {
      const u = new URL(c.url);
      c.navigate('/jbrown/' + u.search + u.hash);
    }
  })());
});
