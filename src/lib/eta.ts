/**
 * ETA aproximado = distancia en línea recta hasta el punto / velocidad
 * actual del bus. Es una aproximación a propósito (no sigue la pista como el
 * trazo del mapa) — alcanza para dar una idea, y se calcula solo con datos
 * que ya se tienen en el front, sin llamadas extra. Sin velocidad confiable
 * (bus detenido o heading/speed en null) no se puede estimar.
 */
export function etaMinutos(distanciaM: number, speedKmh: number | null): number | null {
  if (speedKmh == null || speedKmh < 1) return null
  const minutos = distanciaM / ((speedKmh * 1000) / 60)
  return Number.isFinite(minutos) ? minutos : null
}

export function formatEtaMinutos(minutos: number | null): string | null {
  if (minutos == null) return null
  const redondeado = Math.round(minutos)
  return redondeado < 1 ? '< 1 min' : `≈ ${redondeado} min`
}
