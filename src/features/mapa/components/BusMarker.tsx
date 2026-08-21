import { useEffect, useMemo, useRef } from 'react'
import { Marker } from 'react-leaflet'
import type L from 'leaflet'
import type { GpsLocation } from '@/types/api'
import { createBusIcon } from '@/lib/leaflet-icons'
import { useLastKnownHeading } from '../useLastKnownHeading'

const DURACION_ANIMACION_MS = 1000

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

interface BusMarkerProps {
  location: GpsLocation
  onSelect: () => void
}

/**
 * Cada ping de GPS llega cada varios segundos, así que actualizar la
 * posición del marcador tal cual (`position={[lat,lng]}` reactivo) lo hace
 * "saltar" de golpe a la nueva coordenada. Acá el marcador se desliza
 * suavemente entre una posición y la siguiente con requestAnimationFrame.
 *
 * Para lograrlo, el `position` que se le pasa a <Marker> se congela en el
 * primer render (posicionInicialRef, que nunca cambia) — así react-leaflet
 * nunca vuelve a tocar la posición del marcador por su cuenta, y el único
 * que la mueve después del montaje es este componente, llamando
 * `marker.setLatLng()` directamente en cada frame.
 */
export function BusMarker({ location, onSelect }: BusMarkerProps) {
  const heading = useLastKnownHeading(location.heading)
  const busIcon = useMemo(() => createBusIcon(heading), [heading])

  const markerRef = useRef<L.Marker>(null)
  const posicionInicialRef = useRef<[number, number]>([location.latitude, location.longitude])
  const posicionActualRef = useRef<[number, number]>(posicionInicialRef.current)
  const frameRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const marker = markerRef.current
    if (!marker) return

    const desde = posicionActualRef.current
    const hasta: [number, number] = [location.latitude, location.longitude]

    if (frameRef.current != null) cancelAnimationFrame(frameRef.current)

    const inicio = performance.now()
    function paso(ahora: number) {
      const t = Math.min((ahora - inicio) / DURACION_ANIMACION_MS, 1)
      const siguiente: [number, number] = [lerp(desde[0], hasta[0], t), lerp(desde[1], hasta[1], t)]
      marker!.setLatLng(siguiente)
      posicionActualRef.current = siguiente
      if (t < 1) frameRef.current = requestAnimationFrame(paso)
    }
    frameRef.current = requestAnimationFrame(paso)

    return () => {
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current)
    }
  }, [location.latitude, location.longitude])

  return (
    <Marker
      ref={markerRef}
      position={posicionInicialRef.current}
      icon={busIcon}
      eventHandlers={{ click: onSelect }}
    />
  )
}
