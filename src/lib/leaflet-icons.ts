import L from 'leaflet'

/**
 * Ícono de mapa como un div con Tailwind (el stylesheet global ya está
 * cargado en la página, así que las clases se aplican aunque Leaflet
 * inserte este HTML fuera del árbol de React).
 */
export function createPinIcon(emoji: string, className: string, size: number) {
  return L.divIcon({
    className: '',
    html: `<div class="flex items-center justify-center rounded-full shadow-lg ring-2 ring-white ${className}" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.55)}px">${emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}

/**
 * Ícono del bus con flecha de rumbo alrededor del badge (el emoji 🚌 no es
 * direccional, así que se rota solo la flecha). heading=null (bus detenido
 * o sin rumbo confiable) simplemente no dibuja la flecha; quien la llama
 * debe pasar el último heading conocido si quiere mantenerla fija en vez
 * de ocultarla.
 */
export function createBusIcon(heading: number | null, size = 36) {
  const pad = 10
  const total = size + pad * 2

  const arrow =
    heading != null
      ? `<div class="absolute inset-0" style="transform:rotate(${heading}deg)">
           <div class="absolute left-1/2 top-0 -translate-x-1/2 border-x-[6px] border-x-transparent border-b-[9px] border-b-primary"></div>
         </div>`
      : ''

  return L.divIcon({
    className: '',
    html: `<div class="relative" style="width:${total}px;height:${total}px">
      ${arrow}
      <div class="absolute flex items-center justify-center rounded-full shadow-lg ring-2 ring-white bg-primary text-primary-foreground" style="left:${pad}px;top:${pad}px;width:${size}px;height:${size}px;font-size:${Math.round(size * 0.55)}px">🚌</div>
    </div>`,
    iconSize: [total, total],
    iconAnchor: [total / 2, total / 2],
    popupAnchor: [0, -total / 2 + pad],
  })
}

/** Punto discreto (sin emoji) para paradas informales de una ruta — más pequeño y neutro que un pin de paradero. */
export function createDotIcon(className: string, size = 14) {
  return L.divIcon({
    className: '',
    html: `<div class="rounded-full shadow ring-2 ring-white ${className}" style="width:${size}px;height:${size}px"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  })
}
