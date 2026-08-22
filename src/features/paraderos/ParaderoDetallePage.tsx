import { useCallback, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Bus as BusIcon, Loader2, MapPin, MapPinned, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getErrorMessage } from '@/lib/axios'
import { formatEtaMinutos } from '@/lib/eta'
import { cn } from '@/lib/utils'
import { useBuses } from '@/features/buses/hooks'
import { useRealtimeLocations } from '@/features/mapa/useRealtimeLocations'
import { useFavoritos, useToggleFavorito } from '@/features/favoritos/hooks'
import { usePushNotifications } from '@/features/notificaciones/usePushNotifications'
import { useParadero } from './hooks'
import { BusHaciaParadero, type ProximoBus } from './BusHaciaParadero'

const TIPO_LABEL = { paradero: 'Paradero', parada: 'Parada' } as const

export function ParaderoDetallePage() {
  const { id } = useParams()
  const paraderoId = Number(id)

  const paraderoQuery = useParadero(paraderoId)
  const busesQuery = useBuses()
  const locations = useRealtimeLocations()

  // Esta página ya está protegida por el permiso paraderos.consultar, que
  // solo tiene alumno — así que si se llegó hasta acá, favoritos aplica.
  const favoritosQuery = useFavoritos()
  const toggleFavorito = useToggleFavorito()
  const esFavorito = (favoritosQuery.data ?? []).some((f) => f.paradero.id === paraderoId)
  const { activo: pushActivo } = usePushNotifications()
  const [avisoFavoritoAbierto, setAvisoFavoritoAbierto] = useState(false)

  // Solo los buses con ruta asignada son candidatos a "ir hacia" este
  // paradero — a cada uno se le monta un BusHaciaParadero que corre la
  // inferencia de dirección por su cuenta y reporta acá si aplica.
  const candidatos = useMemo(
    () => (busesQuery.data ?? []).filter((b) => b.ruta_id != null),
    [busesQuery.data],
  )

  const [resultados, setResultados] = useState<Record<number, ProximoBus | null>>({})
  const onResultado = useCallback((busId: number, resultado: ProximoBus | null) => {
    setResultados((prev) => ({ ...prev, [busId]: resultado }))
  }, [])

  const proximos = useMemo(
    () =>
      Object.values(resultados)
        .filter((r): r is ProximoBus => r != null)
        .sort((a, b) => (a.etaMin ?? Number.POSITIVE_INFINITY) - (b.etaMin ?? Number.POSITIVE_INFINITY)),
    [resultados],
  )

  const isLoading = paraderoQuery.isPending
  const paradero = paraderoQuery.data

  return (
    <div className="mx-auto max-w-xl space-y-4 p-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/rutas">
          <ArrowLeft className="size-4" />
          Rutas
        </Link>
      </Button>

      {paraderoQuery.isError && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {getErrorMessage(paraderoQuery.error)}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        paradero && (
          <>
            <Card className="overflow-hidden">
              {paradero.foto ? (
                <img src={paradero.foto} alt="" className="h-44 w-full object-cover" />
              ) : (
                <div className="flex h-32 w-full items-center justify-center bg-muted">
                  <MapPin className="size-10 text-muted-foreground" />
                </div>
              )}
              <CardContent className="space-y-1 pt-4">
                <div className="flex items-start justify-between gap-3">
                  <h1 className="text-lg font-semibold">{paradero.nombre}</h1>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={paradero.tipo === 'paradero' ? 'default' : 'secondary'}>
                      {TIPO_LABEL[paradero.tipo]}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => {
                        const marcando = !esFavorito
                        toggleFavorito.mutate(
                          { paraderoId, esFavorito },
                          { onSuccess: () => marcando && setAvisoFavoritoAbierto(true) },
                        )
                      }}
                      disabled={toggleFavorito.isPending}
                      aria-label={esFavorito ? 'Quitar de favoritos' : 'Marcar como favorito'}
                      className="text-muted-foreground hover:text-amber-500 disabled:opacity-50"
                    >
                      <Star className={cn('size-5', esFavorito && 'fill-amber-400 text-amber-400')} />
                    </button>
                  </div>
                </div>
                {paradero.referencia && (
                  <p className="text-sm text-muted-foreground">{paradero.referencia}</p>
                )}
              </CardContent>
            </Card>

            <div>
              <h2 className="mb-2 px-1 font-medium">Próximos buses</h2>
              <div className="rounded-lg border bg-card">
                {candidatos.length === 0 && (
                  <p className="p-4 text-sm text-muted-foreground">
                    Ningún bus tiene una ruta asignada.
                  </p>
                )}

                {candidatos.length > 0 && proximos.length === 0 && (
                  <p className="p-4 text-sm text-muted-foreground">
                    Ningún bus se dirige a este paradero por ahora.
                  </p>
                )}

                {proximos.map(({ bus, etaMin }, i) => (
                  <div
                    key={bus.id}
                    className={`flex items-center justify-between gap-3 px-4 py-3 ${i < proximos.length - 1 ? 'border-b' : ''}`}
                  >
                    <span className="flex items-center gap-2.5">
                      <BusIcon className="size-4 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium">Bus {bus.placa}</span>
                    </span>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {formatEtaMinutos(etaMin) ?? 'Calculando...'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Button asChild className="w-full">
              <Link to="/mapa">
                <MapPinned className="size-4" />
                Ver en el mapa
              </Link>
            </Button>

            {candidatos.map((bus) => (
              <BusHaciaParadero
                key={bus.id}
                bus={bus}
                paraderoId={paraderoId}
                location={bus.device_id ? locations[bus.device_id] : undefined}
                onResultado={onResultado}
              />
            ))}
          </>
        )
      )}

      <Dialog open={avisoFavoritoAbierto} onOpenChange={setAvisoFavoritoAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🔔 Notificaciones activadas</DialogTitle>
            <DialogDescription>
              Te avisaremos cuando el bus esté cerca o llegue a {paradero?.nombre}.
              {!pushActivo &&
                ' Si no te llegan, revisa que las notificaciones estén permitidas para este sitio en Chrome.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Entendido</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
