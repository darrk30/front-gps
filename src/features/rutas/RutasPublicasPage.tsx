import { Link } from 'react-router-dom'
import { AlertCircle, ChevronRight, MapPinned, Route as RouteIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getErrorMessage } from '@/lib/axios'
import { useRutas } from './hooks'

export function RutasPublicasPage() {
  const { data: rutas, isPending, isError, error } = useRutas()
  const activas = (rutas ?? []).filter((r) => r.activo)

  return (
    <div className="mx-auto max-w-xl space-y-4 p-6">
      <div>
        <h1 className="text-lg font-semibold">Rutas disponibles</h1>
        <p className="text-sm text-muted-foreground">Elegí una ruta para ver sus paraderos.</p>
      </div>

      {isError && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {getErrorMessage(error)}
        </div>
      )}

      <div className="space-y-2.5">
        {isPending &&
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} size="sm">
              <CardContent className="flex items-center gap-3">
                <Skeleton className="size-10 shrink-0 rounded-full" />
                <Skeleton className="h-5 w-2/3" />
              </CardContent>
            </Card>
          ))}

        {!isPending && activas.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No hay rutas activas por ahora.
          </p>
        )}

        {activas.map((ruta) => (
          <Link key={ruta.id} to={`/rutas/${ruta.id}`}>
            <Card size="sm" className="transition-colors hover:bg-accent">
              <CardContent className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <RouteIcon className="size-5" />
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">{ruta.nombre}</span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {!isPending && activas.length > 0 && (
        <Button asChild className="w-full">
          <Link to="/mapa">
            <MapPinned className="size-4" />
            Ver mapa
          </Link>
        </Button>
      )}
    </div>
  )
}
