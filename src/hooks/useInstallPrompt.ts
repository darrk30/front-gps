import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * Capturado a nivel de módulo (no dentro de un useEffect) porque Chrome
 * puede disparar `beforeinstallprompt` apenas carga la página — antes de que
 * React monte el primer componente, sobre todo en visitas repetidas donde ya
 * evaluó la instalabilidad del sitio antes. El evento solo se dispara una
 * vez por carga de página y no hay forma de "volver a pedirlo" si se pierde
 * mientras nadie escuchaba, así que hay que engancharse lo antes posible.
 */
let deferredEvent: BeforeInstallPromptEvent | null = null
const listeners = new Set<(event: BeforeInstallPromptEvent | null) => void>()

function actualizarEvento(event: BeforeInstallPromptEvent | null) {
  deferredEvent = event
  listeners.forEach((listener) => listener(event))
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    actualizarEvento(event as BeforeInstallPromptEvent)
  })
  window.addEventListener('appinstalled', () => actualizarEvento(null))
}

/**
 * Envuelve el evento nativo `beforeinstallprompt` (Chrome/Edge/Android) para
 * poder dispararlo desde un botón propio en vez del mini-banner automático
 * del navegador, que el navegador decide mostrar (o no) según heurísticas
 * propias de varias visitas — poco fiable para depender de él acá.
 */
export function useInstallPrompt() {
  const [event, setEvent] = useState(deferredEvent)

  useEffect(() => {
    setEvent(deferredEvent)
    listeners.add(setEvent)
    return () => {
      listeners.delete(setEvent)
    }
  }, [])

  const instalar = async (): Promise<boolean> => {
    if (!deferredEvent) return false
    await deferredEvent.prompt()
    const { outcome } = await deferredEvent.userChoice
    actualizarEvento(null)
    return outcome === 'accepted'
  }

  return { puedeInstalar: event !== null, instalar }
}
