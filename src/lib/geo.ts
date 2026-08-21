/** Rumbo inicial (0-360°, 0 = Norte, sentido horario) desde `from` hacia `to`. */
export function bearingDeg([lat1, lng1]: [number, number], [lat2, lng2]: [number, number]): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const toDeg = (r: number) => (r * 180) / Math.PI
  const phi1 = toRad(lat1)
  const phi2 = toRad(lat2)
  const deltaLambda = toRad(lng2 - lng1)
  const y = Math.sin(deltaLambda) * Math.cos(phi2)
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda)
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

/** Diferencia angular más corta entre dos rumbos, siempre entre 0 y 180. */
export function angularDiffDeg(a: number, b: number): number {
  const diff = Math.abs(a - b) % 360
  return diff > 180 ? 360 - diff : diff
}

const RADIO_TIERRA_M = 6_371_000

/** Distancia en línea recta entre dos coordenadas, en metros (fórmula haversine). */
export function distanciaMetros([lat1, lng1]: [number, number], [lat2, lng2]: [number, number]): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * RADIO_TIERRA_M * Math.asin(Math.sqrt(a))
}
