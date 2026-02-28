/* eslint-disable no-undef */
/**
 * Firebase Cloud Messaging — Background Service Worker
 *
 * Handles push notifications when the VETTR web app is in the background
 * or closed.  Uses the Firebase compat SDK because service workers cannot
 * use ES module imports.
 *
 * The Firebase config is injected via query parameters on the service
 * worker URL at registration time (see usePushNotifications hook).
 */

importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js');

// ─── Parse config from SW URL query params ──────────────────────────────────
// The registration call appends ?apiKey=...&authDomain=... etc. so we don't
// need to hard-code credentials in a publicly-served JS file.
const url = new URL(self.location.href);
const config = {
  apiKey: url.searchParams.get('apiKey') || '',
  authDomain: url.searchParams.get('authDomain') || '',
  projectId: url.searchParams.get('projectId') || '',
  messagingSenderId: url.searchParams.get('messagingSenderId') || '',
  appId: url.searchParams.get('appId') || '',
};

firebase.initializeApp(config);

const messaging = firebase.messaging();

// ─── Background message handler ─────────────────────────────────────────────
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  const data = payload.data || {};

  if (!title) return;

  self.registration.showNotification(title, {
    body: body || '',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    data: {
      deep_link: data.deep_link || '/',
      alert_id: data.alert_id || '',
      alert_type: data.alert_type || '',
    },
  });
});

// ─── Notification click handler ──────────────────────────────────────────────
// Navigate the user to the deep link embedded in the notification payload.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const deepLink = event.notification.data?.deep_link || '/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus an existing VETTR window if available
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(deepLink);
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(deepLink);
        }
      })
  );
});
