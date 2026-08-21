import { useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import { Loader2 } from 'lucide-react'
import { useTheme } from 'next-themes'
import 'leaflet/dist/leaflet.css'
import { useBuses } from '@/features/buses/hooks'
import { useParaderos } from '@/features/paraderos/hooks'
import { useRuta } from '@/features/rutas/hooks'
import { useRealtimeLocations } from './useRealtimeLocations'
import { useLastKnownHeading } from './useLastKnownHeading'
import { useDireccionEstable } from './useDireccionEstable'
import { BusMarker } from './components/BusMarker'
import { BusDetailPanel } from './components/BusDetailPanel'
import { ParaderoMarker } from './components/ParaderoMarker'
import { RutaLayer } from './components/RutaLayer'
import { SeguirBus } from './components/SeguirBus'

// Centro aproximado del campus de la UNPRG (Lambayeque, Perú).
const UNPRG_CENTER: [number, number] = [-6.7014, -79.9061]

const EMPTY: never[] = []

// Los mosaicos del mapa son imágenes fijas — no siguen el tema de la app por
// su cuenta, hay que pedirle al proveedor un set de mosaicos ya oscuro.
// CARTO Dark Matter es el basemap oscuro gratis estándar para Leaflet/OSM.
const TILES_CLARO = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: 'abc',
}
const TILES_OSCURO = {
  url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
}

export function MapaPage() {
  const { resolvedTheme } = useTheme()
  const tiles = resolvedTheme === 'dark' ? TILES_OSCURO : TILES_CLARO

  const [busSeleccionadoId, setBusSeleccionadoId] = useState<number | null>(null)
  // Alto real de BusDetailPanel — se le pasa a SeguirBus para que centre el
  // bus en el área visible que queda arriba de la tarjeta, no detrás.
  const [panelHeight, setPanelHeight] = useState(0)

  const busesQuery = useBuses()
  const paraderosQuery = useParaderos()
  const locations = useRealtimeLocations()

  const buses = busesQuery.data ?? EMPTY
  const paraderos = paraderosQuery.data ?? EMPTY

  const isLoading = busesQuery.isPending || paraderosQuery.isPending

  const busSeleccionado = busSeleccionadoId != null ? buses.find((b) => b.id === busSeleccionadoId) : undefined
  const locationSeleccionada = busSeleccionado?.device_id ? locations[busSeleccionado.device_id] : undefined

  // Cada bus tiene su propia ruta (bus.ruta_id) — solo se carga la del bus
  // seleccionado, ya que es la única que hace falta dibujar/inferir.
  const rutaSeleccionadaQuery = useRuta(busSeleccionado?.ruta_id)
  const puntosRuta = rutaSeleccionadaQuery.data?.puntos ?? EMPTY

  const headingSeleccionado = useLastKnownHeading(locationSeleccionada?.heading ?? null)
  const direccionSeleccionada = useDireccionEstable(
    puntosRuta,
    busSeleccionado?.id,
    locationSeleccionada,
    headingSeleccionado,
  )

  return (
    <div className="relative isolate h-full min-h-[calc(100svh-3.5rem)]">
      {isLoading && (
        <div className="absolute left-4 top-4 z-[1000] flex items-center gap-2 rounded-md bg-card px-3 py-1.5 text-xs text-muted-foreground shadow">
          <Loader2 className="size-3.5 animate-spin" />
          Cargando datos...
        </div>
      )}

      <MapContainer center={UNPRG_CENTER} zoom={15} className="h-full w-full">
        <TileLayer attribution={tiles.attribution} url={tiles.url} subdomains={tiles.subdomains} />

        {locationSeleccionada && (
          <>
            <RutaLayer location={locationSeleccionada} direccion={direccionSeleccionada} />
            <SeguirBus location={locationSeleccionada} offsetBottomPx={panelHeight} />
          </>
        )}

        {paraderos.map((paradero) => (
          <ParaderoMarker key={paradero.id} paradero={paradero} />
        ))}

        {buses.map((bus) => {
          const location = bus.device_id ? locations[bus.device_id] : undefined
          if (!location) return null
          return (
            <BusMarker
              key={bus.id}
              location={location}
              onSelect={() => setBusSeleccionadoId(bus.id)}
            />
          )
        })}
      </MapContainer>

      {busSeleccionado && locationSeleccionada && (
        <BusDetailPanel
          bus={busSeleccionado}
          location={locationSeleccionada}
          direccion={direccionSeleccionada}
          onClose={() => setBusSeleccionadoId(null)}
          onHeightChange={setPanelHeight}
        />
      )}
    </div>
  )
}
