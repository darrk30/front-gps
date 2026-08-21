import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/axios'
import { cn } from '@/lib/utils'
import { useRuta } from './hooks'

export function RutaDetallePublicaPage() {
  const { id } = useParams()
  const rutaId = Number(id)
  const rutaQuery = useRuta(rutaId)

  const puntos = useMemo(
    () => (rutaQuery.data ? [...rutaQuery.data.puntos].sort((a, b) => a.orden - b.orden) : []),
    [rutaQuery.data],
  )

  return (
    <div className="mx-auto max-w-xl space-y-4 p-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/rutas">
          <ArrowLeft className="size-4" />
          Rutas
        </Link>
      </Button>

      <div>
        <h1 className="text-lg font-semibold">
          {rutaQuery.isPending ? 'Cargando ruta...' : rutaQuery.data?.nombre}
        </h1>
        <p className="text-sm text-muted-foreground">Paraderos y paradas de esta ruta, en orden.</p>
      </div>

      {rutaQuery.isError && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {getErrorMessage(rutaQuery.error)}
        </div>
      )}

      {rutaQuery.isPending ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : puntos.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Esta ruta todavía no tiene paraderos.
        </p>
      ) : (
        <div className="rounded-lg border bg-card">
          {puntos.map((punto, i) => {
            const esInicio = i === 0
            const esFin = i === puntos.length - 1
            return (
              <Link
                key={punto.id}
                to={`/paraderos/${punto.paradero.id}`}
                className="flex gap-3 px-4 hover:bg-accent"
              >
                {/* Columna del "riel": el punto y el tramo de línea que lo conecta con
                    el siguiente siguen el mismo ancho fijo en cada fila, así arman una
                    línea continua de arriba a abajo sin necesitar posicionamiento absoluto. */}
                <div className="flex w-4 shrink-0 flex-col items-center">
                  <span
                    className={cn(
                      'mt-5 size-3 shrink-0 rounded-full ring-4 ring-card',
                      esInicio ? 'bg-green-500' : esFin ? 'bg-red-500' : 'bg-blue-500',
                    )}
                  />
                  {!esFin && <span className="w-px flex-1 bg-border" />}
                </div>

                <div
                  className={cn(
                    'flex min-w-0 flex-1 items-center justify-between gap-3 py-4',
                    !esFin && 'border-b',
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {punto.nombre}
                      {esInicio && <span className="text-muted-foreground"> (Inicio)</span>}
                      {esFin && <span className="text-muted-foreground"> (Fin)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {punto.tipo === 'paradero' ? 'Paradero' : 'Parada'}
                    </p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
