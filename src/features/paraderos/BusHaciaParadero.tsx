import { useEffect } from 'react'
import type { Bus, GpsLocation } from '@/types/api'
import { useRuta } from '@/features/rutas/hooks'
import { useLastKnownHeading } from '@/features/mapa/useLastKnownHeading'
import { useDireccionEstable } from '@/features/mapa/useDireccionEstable'
import { etaMinutos } from '@/lib/eta'

const EMPTY: never[] = []

export interface ProximoBus {
  bus: Bus
  etaMin: number | null
  distanciaM: number
}

/**
 * Componente "headless" (no renderiza nada visible): corre, para UN bus
 * puntual, la misma inferencia de dirección que usa el mapa (heading +
 * puntos de su ruta) y le avisa al padre si `paraderoId` está en lo que le
 * queda de tramo por recorrer — con su ETA. `paraderoId` puede ser tanto el
 * destino final comprometido (un "paradero") como una "parada" intermedia
 * de paso: `tramo` trae ambos en orden, así que se busca por cualquiera de
 * los dos, no solo por `direccion.destino`. Se monta uno por cada bus
 * candidato (ver ParaderoDetallePage) porque el hook de dirección necesita
 * una instancia propia por bus para mantener su "memoria" (histéresis) sin
 * mezclarse entre buses.
 */
export function BusHaciaParadero({
  bus,
  paraderoId,
  location,
  onResultado,
}: {
  bus: Bus
  paraderoId: number
  location: GpsLocation | undefined
  onResultado: (busId: number, resultado: ProximoBus | null) => void
}) {
  const rutaQuery = useRuta(bus.ruta_id)
  const puntosRuta = rutaQuery.data?.puntos ?? EMPTY
  const heading = useLastKnownHeading(location?.heading ?? null)
  const direccion = useDireccionEstable(puntosRuta, bus.id, location, heading)

  const idxEnTramo = direccion?.tramo.findIndex((p) => p.paradero.id === paraderoId) ?? -1
  const distanciaM = idxEnTramo !== -1 ? (direccion?.distanciasM[idxEnTramo] ?? null) : null
  const speed = location?.speed ?? null

  useEffect(() => {
    if (distanciaM == null) {
      onResultado(bus.id, null)
      return
    }
    onResultado(bus.id, { bus, etaMin: etaMinutos(distanciaM, speed), distanciaM })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bus.id, distanciaM, speed, onResultado])

  return null
}
