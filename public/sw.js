// Replacement worker for stale app-shell caches on cuddles-ai.com. It removes
// old Workbox/Vite app caches without touching messaging/notification workers.
function isAppShellCache(name) {
  const lowerName = name.toLowerCase();
  const isNotificationCache = /firebase|onesignal|messaging|notification/.test(lowerName);
  const isKnownAppCache = /workbox|vite-pwa|precache|runtime|googleanalytics|cuddles/.test(lowerName);

  return isKnownAppCache && !isNotificationCache;
}

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) =>
  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        const workboxCacheNames = cacheNames.filter(isAppShellCache);
        await Promise.allSettled(workboxCacheNames.map((name) => caches.delete(name)));
        await self.clients.claim();
        const windowClients = await self.clients.matchAll({ type: "window" });
        await Promise.allSettled(windowClients.map((client) => client.navigate(client.url)));
      } finally {
        await self.registration.unregister();
      }
    })(),
  ),
);