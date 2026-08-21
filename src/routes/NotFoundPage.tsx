import { Link } from 'react-router-dom'
import { MapPinOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Contenido del 404, compartido por la variante standalone y la variante dentro de la app (ver CatchAllRoute). */
export function NotFoundPage({ className = 'min-h-svh' }: { className?: string }) {
  return (
    <div
      className={`flex ${className} flex-col items-center justify-center gap-3 p-4 text-center text-muted-foreground`}
    >
      <MapPinOff className="size-10" />
      <h1 className="text-2xl font-semibold text-foreground">Página no encontrada</h1>
      <p className="text-sm">La ruta a la que intentaste entrar no existe.</p>
      <Button asChild>
        <Link to="/">Volver al inicio</Link>
      </Button>
    </div>
  )
}
