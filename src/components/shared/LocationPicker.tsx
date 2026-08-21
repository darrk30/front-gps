import type L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet'
import { createPinIcon } from '@/lib/leaflet-icons'

const pinIcon = createPinIcon('📍', 'bg-amber-500 text-white', 30)

interface LocationPickerProps {
  latitude?: number
  longitude?: number
  onChange: (lat: number, lng: number) => void
  defaultCenter: [number, number]
  disabled?: boolean
}

function ClickHandler({
  onChange,
  disabled,
}: {
  onChange: (lat: number, lng: number) => void
  disabled?: boolean
}) {
  useMapEvents({
    click(e) {
      if (disabled) return
      onChange(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

/**
 * Selector visual de ubicación: clic en el mapa o arrastrar el marcador
 * actualizan lat/lng. El `key` cambia una sola vez (sin ubicación -> con
 * ubicación) para recentrar el mapa en el primer punto elegido; luego el
 * mapa queda estable y no se remonta con cada clic.
 */
export function LocationPicker({
  latitude,
  longitude,
  onChange,
  defaultCenter,
  disabled,
}: LocationPickerProps) {
  const hasPosition = latitude != null && longitude != null
  const position: [number, number] = hasPosition ? [latitude, longitude] : defaultCenter

  function handleDragEnd(e: L.DragEndEvent) {
    const pos = e.target.getLatLng()
    onChange(pos.lat, pos.lng)
  }

  return (
    <div className="space-y-1.5">
      <div className="isolate overflow-hidden rounded-md border">
        <MapContainer
          key={hasPosition ? 'set' : 'unset'}
          center={position}
          zoom={hasPosition ? 16 : 14}
          className="h-64 w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onChange={onChange} disabled={disabled} />
          {hasPosition && (
            <Marker
              position={position}
              icon={pinIcon}
              draggable={!disabled}
              eventHandlers={{ dragend: handleDragEnd }}
            />
          )}
        </MapContainer>
      </div>
      <p className="text-xs text-muted-foreground">
        {hasPosition
          ? `Ubicación seleccionada: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`
          : 'Haz clic en el mapa para ubicar el paradero.'}
      </p>
    </div>
  )
}
