// Firebase Cloud Messaging — background message handler
// This service worker is auto-discovered by FCM when no custom SW registration is provided.
// It handles push notifications when the app is in the background or closed.

importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js",
);

// Firebase config is sent from the client via postMessage on first registration.
let app;
let _messaging;

self.addEventListener("message", (event) => {
  if (event.data?.type === "FIREBASE_CONFIG") {
    if (app) return; // already initialised
    app = firebase.initializeApp(event.data.config);
    _messaging = firebase.messaging();
  }
});

// Handle background push messages delivered by FCM
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { notification: { title: "Onwynd", body: event.data.text() } };
  }

  const notification = payload.notification ?? {};
  const data = payload.data ?? {};

  // Some FCM messages use a data-only payload (no notification block).
  // In that case fall back to data.title / data.body so the OS shows the
  // correct text instead of the generic "Onwynd" default.
  const title = notification.title || data.title || "Onwynd";
  const options = {
    body: notification.body || data.body || "You have a new notification",
    icon: notification.icon || data.icon || "/logo.svg",
    badge: notification.badge || "/logo.svg",
    tag: data.tag || "default",
    data,
    requireInteraction: data.requireInteraction === "true",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data ?? {};
  let targetUrl = data.url || "/";

  if (data.type === "appointment_reminder_1h" && data.join_url) {
    targetUrl = data.join_url;
  } else if (data.type === "streak_reminder") {
    targetUrl = "/dashboard";
  } else if (data.type === "achievement_unlocked") {
    targetUrl = "/achievements";
  }

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.postMessage({ type: "NOTIFICATION_CLICK", data });
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      }),
  );
});
