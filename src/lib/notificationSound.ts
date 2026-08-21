let audioCtx: AudioContext | null = null

function getAudioCtx(): AudioContext {
  audioCtx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  return audioCtx
}

/**
 * Los navegadores solo dejan reproducir audio (Web Audio incluido) después de
 * un gesto real del usuario (click/tecla/touch) en la página — si el primer
 * intento de sonido ocurre por un push que llega antes de esa interacción, el
 * `resume()` del AudioContext queda "suspended" para siempre y la campanilla
 * nunca suena, en silencio. Esto crea el contexto (y lo resume) apenas ocurre
 * el primer gesto, sin esperar a que llegue una notificación, así queda
 * desbloqueado de antemano. Se llama una sola vez desde main.tsx.
 */
export function desbloquearAudioTrasGesto(): void {
  const eventos = ['pointerdown', 'keydown', 'touchstart'] as const

  const desbloquear = () => {
    const ctx = getAudioCtx()
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    eventos.forEach((evento) => document.removeEventListener(evento, desbloquear))
  }

  eventos.forEach((evento) => document.addEventListener(evento, desbloquear, { once: true }))
}

/**
 * Campanilla corta de dos tonos generada con Web Audio (sin archivo de
 * audio de por medio) para notificaciones en primer plano — en segundo
 * plano/cerrada, el sonido de notificación lo pone el sistema operativo
 * automáticamente vía el service worker (ver public/firebase-messaging-sw.js).
 */
export function reproducirSonidoNotificacion() {
  try {
    const ctx = getAudioCtx()
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})

    const ahora = ctx.currentTime
    ;[880, 1318.51].forEach((frecuencia, i) => {
      const oscilador = ctx.createOscillator()
      const ganancia = ctx.createGain()
      oscilador.type = 'sine'
      oscilador.frequency.value = frecuencia
      const inicio = ahora + i * 0.12
      ganancia.gain.setValueAtTime(0, inicio)
      ganancia.gain.linearRampToValueAtTime(0.2, inicio + 0.02)
      ganancia.gain.exponentialRampToValueAtTime(0.001, inicio + 0.35)
      oscilador.connect(ganancia)
      ganancia.connect(ctx.destination)
      oscilador.start(inicio)
      oscilador.stop(inicio + 0.35)
    })
  } catch {
    // Web Audio no disponible/bloqueado — la notificación sigue mostrándose, solo sin sonido.
  }
}
