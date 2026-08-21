import { Marker, Polyline, Popup } from 'react-leaflet'
import type { GpsLocation } from '@/types/api'
import { createDotIcon } from '@/lib/leaflet-icons'
import type { DireccionBus } from '../useDireccionEstable'
import { roundCoord, useRoadRoute } from '../useRoadRoute'

const paradaIcon = createDotIcon('bg-slate-400 dark:bg-slate-500', 14)

const LINEA_RUTA = { color: '#3b82f6', weight: 4, opacity: 0.7 }

/**
 * Dibuja solo el tramo pendiente hasta el próximo paradero en la dirección
 * inferida (`direccion.tramo`, ver useDireccionEstable.ts) — no la ruta
 * completa. Los tipo "parada" del tramo llevan su propio marcador; los tipo
 * "paradero" ya se pintan aparte vía ParaderoMarker/GET /paraderos.
 */
export function RutaLayer({ location, direccion }: { location: GpsLocation; direccion: DireccionBus | null }) {
  const primerPunto = direccion?.tramo[0]

  // Tramo entre los puntos fijos de la ruta: se cachea por sus IDs, así que
  // solo pide una ruta nueva cuando el bus cambia de destino/tramo.
  const tramoKey = direccion ? direccion.tramo.map((p) => p.id).join('-') : ''
  const tramoQuery = useRoadRoute(tramoKey, direccion?.tramo ?? [])

  // "Última milla": de la posición real y en vivo del bus hasta el primer
  // punto del tramo. Antes se dejaba en línea recta a propósito para no
  // llamar a OSRM en cada ping de GPS, pero eso podía cortar feo por encima
  // de las casas cuando el bus estaba lejos del punto (ver captura del
  // usuario). Ahora también se snapea a la pista, pero la queryKey usa la
  // posición del bus REDONDEADA a ~110m — así solo se le pide una ruta nueva
  // a OSRM cuando el bus se movió lo suficiente como para cruzar de "celda",
  // no en cada ping.
  const busKey =
    primerPunto != null
      ? `${roundCoord(location.latitude)},${roundCoord(location.longitude)}-${primerPunto.id}`
      : ''
  const conectorPuntos = primerPunto ? [location, primerPunto] : []
  const conectorQuery = useRoadRoute(busKey, conectorPuntos)

  if (!direccion || direccion.tramo.length === 0) return null

  const tramoPositions: [number, number][] =
    tramoQuery.data ?? direccion.tramo.map((p): [number, number] => [p.latitude, p.longitude])

  const conectorPositions: [number, number][] = conectorQuery.data ?? [
    [location.latitude, location.longitude],
    [primerPunto!.latitude, primerPunto!.longitude],
  ]

  const posiciones: [number, number][] = [...conectorPositions, ...tramoPositions]

  return (
    <>
      <Polyline positions={posiciones} pathOptions={LINEA_RUTA} />

      {direccion.tramo
        .filter((punto) => punto.tipo === 'parada')
        .map((punto) => (
          <Marker key={punto.id} position={[punto.latitude, punto.longitude]} icon={paradaIcon}>
            <Popup className="map-popup">
              <div className="p-2.5 text-xs font-medium">{punto.nombre}</div>
            </Popup>
          </Marker>
        ))}
    </>
  )
}
