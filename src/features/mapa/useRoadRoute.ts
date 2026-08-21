import { useQuery } from '@tanstack/react-query'

const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving'

interface OsrmResponse {
  code: string
  routes: { geometry: { coordinates: [number, number][] } }[]
}

interface Waypoint {
  latitude: number
  longitude: number
}

async function fetchRoadRoute(puntos: Waypoint[]) {
  const coords = puntos.map((p) => `${p.longitude},${p.latitude}`).join(';')
  const res = await fetch(`${OSRM_URL}/${coords}?overview=full&geometries=geojson`)
  if (!res.ok) throw new Error('No se pudo calcular la ruta sobre la pista.')

  const data: OsrmResponse = await res.json()
  const ruta = data.routes[0]
  if (data.code !== 'Ok' || !ruta) throw new Error('OSRM no devolvió una ruta.')

  return ruta.geometry.coordinates.map(([lng, lat]): [number, number] => [lat, lng])
}

/**
 * Redondea a ~110m de grilla (3 decimales). Se usa para armar la queryKey
 * de un punto que se mueve todo el tiempo (la posición en vivo del bus): así
 * react-query reutiliza la misma ruta cacheada mientras el bus se mantiene
 * dentro de la misma celda, y solo le pide una nueva a OSRM cuando cruza a
 * la siguiente — en vez de en cada ping de GPS.
 */
export function roundCoord(n: number) {
  return Math.round(n * 1000) / 1000
}

/**
 * Camino sobre la red vial real (servidor demo público de OSRM) entre una
 * secuencia de puntos, en vez de líneas rectas que cortan por encima de las
 * casas. `key` decide cuándo se vuelve a pedir — pasale algo estable (ids de
 * puntos fijos) o algo cuantizado (`roundCoord` sobre una posición en vivo)
 * según el caso, ver RutaLayer.
 *
 * OSRM demo público: sin API key, pero sin garantía de uptime/rate limit —
 * es lo estándar para un proyecto de este tamaño; si más adelante hace falta
 * más confiabilidad, se autohospeda OSRM y solo cambia `OSRM_URL`.
 */
export function useRoadRoute(key: string, puntos: Waypoint[]) {
  return useQuery({
    queryKey: ['road-route', key],
    queryFn: () => fetchRoadRoute(puntos),
    enabled: puntos.length >= 2 && key !== '',
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    meta: { silent: true },
  })
}
