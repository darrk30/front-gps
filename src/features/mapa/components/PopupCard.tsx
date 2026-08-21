import type { ReactNode } from 'react'

interface PopupCardProps {
  image?: string | null
  title: ReactNode
  subtitle?: ReactNode
  children?: ReactNode
}

/**
 * Contenido de los popups de marcador (bus/paradero) con estilo de tarjeta:
 * foto de portada a todo el ancho + datos compactos debajo. El padding
 * propio de Leaflet se anula globalmente para esto vía la clase
 * "map-popup" (ver index.css) puesta en el <Popup>.
 */
export function PopupCard({ image, title, subtitle, children }: PopupCardProps) {
  return (
    <div className="w-52">
      {image && <img src={image} alt="" className="block h-28 w-full object-cover" />}
      <div className="space-y-0.5 p-2.5">
        <p className="text-sm leading-tight font-semibold">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        {children}
      </div>
    </div>
  )
}
