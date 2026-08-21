let audioCtx: AudioContext | null = null

/**
 * Campanilla corta de dos tonos generada con Web Audio (sin archivo de
 * audio de por medio) para notificaciones en primer plano — en segundo
 * plano/cerrada, el sonido de notificación lo pone el sistema operativo
 * automáticamente vía el service worker (ver public/firebase-messaging-sw.js).
 */
export function reproducirSonidoNotificacion() {
  try {
    audioCtx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {})

    const ahora = audioCtx.currentTime
    ;[880, 1318.51].forEach((frecuencia, i) => {
      const oscilador = audioCtx!.createOscillator()
      const ganancia = audioCtx!.createGain()
      oscilador.type = 'sine'
      oscilador.frequency.value = frecuencia
      const inicio = ahora + i * 0.12
      ganancia.gain.setValueAtTime(0, inicio)
      ganancia.gain.linearRampToValueAtTime(0.2, inicio + 0.02)
      ganancia.gain.exponentialRampToValueAtTime(0.001, inicio + 0.35)
      oscilador.connect(ganancia)
      ganancia.connect(audioCtx!.destination)
      oscilador.start(inicio)
      oscilador.stop(inicio + 0.35)
    })
  } catch {
    // Web Audio no disponible/bloqueado — la notificación sigue mostrándose, solo sin sonido.
  }
}
