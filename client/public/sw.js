/* No authenticated pages or API responses are cached. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('push', (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch { /* Display a generic reminder. */ }
  event.waitUntil(self.registration.showNotification(payload.title || 'My Daily Page', {
    body: payload.body || 'Un rappel t’attend.', icon: '/icons/icon-192.png', badge: '/icons/icon-192.png', tag: payload.tag,
    data: { url: payload.url || '/dashboard/today' },
  }));
});
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || '/dashboard/today', self.location.origin);
  if (url.origin !== self.location.origin) return;
  event.waitUntil(self.clients.openWindow(url.href));
});
