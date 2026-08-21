import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import type { GpsLocation } from '@/types/api'

interface SeguirBusProps {
  location: GpsLocation
  /**
   * Alto en px de lo que tapa la tarjeta de detalle desde abajo (ver
   * BusDetailPanel.onHeightChange). Se resta del centrado corriendo el
   * "centro" del mapa hacia abajo esa distancia, así el bus termina
   * centrado en el área visible que queda arriba de la tarjeta en vez de
   * escondido detrás — 0/undefined = centrado normal.
   */
  offsetBottomPx?: number
}

/**
 * Centra el mapa en la posición del bus seleccionado y lo sigue en cada
 * ping de GPS nuevo (sin tocar el zoom que tenga puesto el usuario). Se
 * monta solo mientras hay un bus seleccionado con ubicación conocida — ver
 * MapaPage — así que al cerrar el panel/deseleccionar, se desmonta y deja
 * de seguirlo automáticamente.
 */
export function SeguirBus({ location, offsetBottomPx = 0 }: SeguirBusProps) {
  const map = useMap()

  useEffect(() => {
    const objetivo: [number, number] = [location.latitude, location.longitude]

    if (offsetBottomPx <= 0) {
      map.panTo(objetivo, { animate: true, duration: 0.5 })
      return
    }

    const zoom = map.getZoom()
    const puntoObjetivo = map.project(objetivo, zoom)
    const puntoCorrido = puntoObjetivo.add([0, offsetBottomPx / 2])
    const centroCorrido = map.unproject(puntoCorrido, zoom)
    map.setView(centroCorrido, zoom, { animate: true, duration: 0.5 })
  }, [map, location.latitude, location.longitude, offsetBottomPx])

  return null
}
