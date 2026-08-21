import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

declare global {
  interface Window {
    Pusher: typeof Pusher
  }
}

let echoInstance: Echo<'reverb'> | null = null

/**
 * Instancia perezosa: si VITE_REVERB_APP_KEY no está configurada (backend
 * de Reverb aún no copiado al .env), devuelve null en vez de romper la app.
 */
export function getEcho() {
  const key = import.meta.env.VITE_REVERB_APP_KEY
  if (!key) return null

  if (!echoInstance) {
    window.Pusher = Pusher
    echoInstance = new Echo({
      broadcaster: 'reverb',
      key,
      wsHost: import.meta.env.VITE_REVERB_HOST,
      wsPort: Number(import.meta.env.VITE_REVERB_PORT) || 80,
      forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
      enabledTransports: ['ws', 'wss'],
    })
  }

  return echoInstance
}
