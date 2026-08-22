import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getMessaging, getToken, isSupported, onMessage, type Messaging } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined

let app: FirebaseApp | null = null
function getFirebaseApp(): FirebaseApp | null {
  if (!firebaseConfig.apiKey) return null
  if (!app) app = initializeApp(firebaseConfig)
  return app
}

/**
 * El service worker es un archivo estático (public/firebase-messaging-sw.js)
 * que no pasa por Vite, así que no puede leer `import.meta.env` — le pasamos
 * la config de Firebase por query string al registrarlo (son los mismos
 * valores "seguros de exponer en el front" que ya viajan en el bundle).
 *
 * También es el service worker de la PWA (scope "/"): se registra una sola
 * vez al arrancar la app (ver iniciarServiceWorkerPwa más abajo, llamado
 * desde main.tsx) sin importar el rol — es lo que permite instalar la app.
 * El flujo de push (solicitarTokenPush) reutiliza ese mismo registro en vez
 * de crear uno nuevo.
 */
let registroSwPromise: Promise<ServiceWorkerRegistration | null> | null = null

function registrarServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return Promise.resolve(null)
  if (!registroSwPromise) {
    const params = new URLSearchParams(
      Object.entries(firebaseConfig).filter((entry): entry is [string, string] => Boolean(entry[1])),
    )
    registroSwPromise = navigator.serviceWorker.register(`/firebase-messaging-sw.js?${params}`)
  }
  return registroSwPromise
}

/** Registra el service worker al arrancar la app (necesario para que el navegador la ofrezca como instalable). */
export function iniciarServiceWorkerPwa(): void {
  registrarServiceWorker().catch(() => {})
}

let messagingInstance: Messaging | null | undefined // undefined = todavía no resuelto

async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (messagingInstance !== undefined) return messagingInstance

  const firebaseApp = getFirebaseApp()
  if (!firebaseApp || !(await isSupported())) {
    messagingInstance = null
    return null
  }

  messagingInstance = getMessaging(firebaseApp)
  return messagingInstance
}

/**
 * Pide permiso de notificaciones (si todavía no se decidió) y, si se
 * concede, registra el service worker y devuelve el token FCM del
 * dispositivo. `null` si Firebase no está configurado (faltan las variables
 * VITE_FIREBASE_... o VITE_FIREBASE_VAPID_KEY en .env), el navegador no
 * soporta push, o el usuario ya había denegado el permiso.
 */
export async function solicitarTokenPush(): Promise<string | null> {
  if (!vapidKey) return null

  const messaging = await getFirebaseMessaging()
  if (!messaging) return null

  if (Notification.permission === 'default') {
    const permiso = await Notification.requestPermission()
    if (permiso !== 'granted') return null
  } else if (Notification.permission !== 'granted') {
    return null
  }

  const registration = await registrarServiceWorker()
  if (!registration) return null

  try {
    return await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration })
  } catch {
    return null
  }
}

/**
 * Notificaciones que llegan mientras la app está abierta (primer plano) —
 * a diferencia de segundo plano/cerrada (que las muestra solo el service
 * worker), estas NO se muestran solas: hay que escucharlas a mano.
 * Devuelve una función para dejar de escuchar.
 */
export function escucharPushEnPrimerPlano(
  onMensaje: (payload: { titulo?: string; mensaje?: string; tipo?: string }) => void,
): () => void {
  let cancelado = false
  let unsubscribe: (() => void) | null = null

  getFirebaseMessaging().then((messaging) => {
    if (cancelado || !messaging) return
    unsubscribe = onMessage(messaging, (payload) => {
      onMensaje({
        titulo: payload.notification?.title,
        mensaje: payload.notification?.body,
        tipo: payload.data?.tipo,
      })
    })
  })

  return () => {
    cancelado = true
    unsubscribe?.()
  }
}
