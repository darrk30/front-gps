// Service Worker de Firebase Cloud Messaging — maneja las notificaciones que
// llegan mientras la app está en segundo plano o cerrada (en primer plano,
// el `onMessage()` del SDK en la app hace el trabajo, ver src/lib/firebase.ts).
//
// Este archivo es estático (no pasa por Vite/TS), así que no puede leer
// `import.meta.env` — la config de Firebase le llega por query string al
// registrarlo (ver registrarServiceWorker() en src/lib/firebase.ts), que es
// el mismo dato "seguro de exponer en el front" que ya usa el resto de la app.
importScripts('https://www.gstatic.com/firebasejs/10.13.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.13.1/firebase-messaging-compat.js')

const params = new URL(location.href).searchParams

firebase.initializeApp({
  apiKey: params.get('apiKey'),
  authDomain: params.get('authDomain'),
  projectId: params.get('projectId'),
  messagingSenderId: params.get('messagingSenderId'),
  appId: params.get('appId'),
})

// Sin esto, cada vez que este archivo cambia el navegador deja el service
// worker nuevo "esperando" hasta que se cierren todas las pestañas — mientras
// tanto el token de push queda apuntando a un registro que nunca se activa y
// las notificaciones se pierden en silencio. Con skipWaiting + clients.claim
// el SW nuevo toma control apenas se instala, sin esperar nada.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

const messaging = firebase.messaging()

// El SO reproduce solo el sonido de notificación por defecto (no seteamos
// `silent: true`) — la Notifications API no permite un archivo de sonido
// personalizado en segundo plano de forma confiable entre navegadores.
messaging.onBackgroundMessage((payload) => {
  const titulo = payload.notification?.title ?? 'UNPRG Bus Tracker'
  self.registration.showNotification(titulo, {
    body: payload.notification?.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200],
    tag: payload.data?.paradero_id ? `paradero-${payload.data.paradero_id}` : undefined,
    renotify: true,
    data: payload.data,
  })
})

// Al tocar la notificación del sistema, enfoca/abre la app.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) return clientList[0].focus()
      return self.clients.openWindow('/')
    }),
  )
})
