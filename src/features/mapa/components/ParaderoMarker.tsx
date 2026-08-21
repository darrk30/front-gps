import { Marker, Popup } from 'react-leaflet'
import type { Paradero } from '@/types/api'
import { createDotIcon, createPinIcon } from '@/lib/leaflet-icons'
import { PopupCard } from './PopupCard'

const paraderoIcon = createPinIcon('📍', 'bg-amber-500 text-white', 30)
const paradaIcon = createDotIcon('bg-slate-400 dark:bg-slate-500', 14)

const TIPO_LABEL = { paradero: 'Paradero', parada: 'Parada' } as const

export function ParaderoMarker({ paradero }: { paradero: Paradero }) {
  const icon = paradero.tipo === 'paradero' ? paraderoIcon : paradaIcon

  return (
    <Marker position={[paradero.latitude, paradero.longitude]} icon={icon}>
      <Popup className="map-popup" minWidth={208}>
        <PopupCard image={paradero.foto} title={paradero.nombre} subtitle={TIPO_LABEL[paradero.tipo]}>
          {paradero.referencia && <p className="text-xs">{paradero.referencia}</p>}
        </PopupCard>
      </Popup>
    </Marker>
  )
}
