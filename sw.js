const CACHE = 'anc-tracker-v1';
const ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => caches.match('./index.html')))
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window' }).then(list => {
    if (list.length) return list[0].focus();
    return clients.openWindow('./index.html');
  }));
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SCHEDULE_NOTIFICATIONS') {
    const { notifications } = e.data;
    notifications.forEach(n => {
      const delay = n.timestamp - Date.now();
      if (delay > 0 && delay < 7 * 24 * 60 * 60 * 1000) {
        setTimeout(() => {
          self.registration.showNotification(n.title, {
            body: n.body,
            icon: './icons/icon-192.png',
            badge: './icons/icon-192.png',
            tag: n.tag,
            requireInteraction: true
          });
        }, delay);
      }
    });
  }
});
