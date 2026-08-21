import { useEffect, useRef } from 'react'
import { Bus as BusIcon, Clock, Flag, MapPin, Route, User, X } from 'lucide-react'
import type { ComponentType } from 'react'
import type { Bus, GpsLocation } from '@/types/api'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Thumbnail } from '@/components/shared/Thumbnail'
import { etaMinutos, formatEtaMinutos } from '@/lib/eta'
import type { DireccionBus } from '../useDireccionEstable'

function formatEta(distanciaM: number, speedKmh: number | null): string | null {
  return formatEtaMinutos(etaMinutos(distanciaM, speedKmh))
}

const VELOCIDAD_MAXIMA_KMH = 180

/** Anillo tipo velocímetro: el arco azul avanza de 0 a `VELOCIDAD_MAXIMA_KMH`. */
function Velocimetro({ speedKmh }: { speedKmh: number }) {
  const fraccion = Math.min(Math.max(speedKmh, 0), VELOCIDAD_MAXIMA_KMH) / VELOCIDAD_MAXIMA_KMH
  const angulo = fraccion * 360
  const pista = 'color-mix(in oklch, var(--color-blue-500) 18%, transparent)'

  return (
    <div
      className="flex size-14 shrink-0 items-center justify-center rounded-full p-[3px]"
      style={{
        background: `conic-gradient(var(--color-blue-500) ${angulo}deg, ${pista} ${angulo}deg 360deg)`,
      }}
      title="Velocidad"
    >
      <div className="flex size-full flex-col items-center justify-center rounded-full bg-card">
        <span className="text-lg font-bold leading-none tabular-nums">{Math.round(speedKmh)}</span>
        <span className="text-[9px] leading-none text-muted-foreground">km/h</span>
      </div>
    </div>
  )
}

function IconoFila({ icon: Icon }: { icon: ComponentType<{ className?: string }> }) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
      <Icon className="size-4" />
    </span>
  )
}

function EtaChip({ eta }: { eta: string }) {
  return (
    <span className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-400">
      <Clock className="size-2.5" />
      {eta}
    </span>
  )
}

const OFFSET_INFERIOR_PX = 16 // el `bottom-4` del wrapper — no forma parte del alto medido de la Card.

interface BusDetailPanelProps {
  bus: Bus
  location: GpsLocation
  /** Dirección inferida en el front (heading + puntos de la ruta del bus) — ver useDireccionEstable.ts. */
  direccion: DireccionBus | null
  onClose: () => void
  /** Alto real (en px) que ocupa la tarjeta, para que MapaPage pueda centrar el bus arriba de ella en vez de detrás — ver SeguirBus. */
  onHeightChange?: (height: number) => void
}

/**
 * Panel flotante (no modal) sobre el mapa: se posiciona abajo-centrado y no
 * bloquea el mapa con un fondo oscuro ni con foco atrapado — el usuario debe
 * poder seguir moviendo/haciendo zoom mientras lo ve, y solo se cierra con la
 * X (no al hacer clic afuera ni con Escape, a diferencia de un <Dialog>).
 */
export function BusDetailPanel({ bus, location, direccion, onClose, onHeightChange }: BusDetailPanelProps) {
  const sinRuta = bus.ruta == null && direccion == null

  const siguientePunto = direccion?.tramo[0]
  // Si el próximo punto ya ES el paradero (no hay paradas intermedias antes),
  // no repetimos la misma fila dos veces.
  const mostrarSiguientePunto = siguientePunto != null && siguientePunto.id !== direccion?.destino.id
  const etaSiguiente = direccion ? formatEta(direccion.distanciaSiguienteM, location.speed) : null
  const etaDestino = direccion ? formatEta(direccion.distanciaDestinoM, location.speed) : null

  const cardRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = cardRef.current
    if (!el || !onHeightChange) return
    const observer = new ResizeObserver(([entry]) => {
      onHeightChange(entry.contentRect.height + OFFSET_INFERIOR_PX)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [onHeightChange])

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-[1000] flex justify-center px-4">
      <Card ref={cardRef} className="pointer-events-auto w-full max-w-sm shadow-lg">
        <CardHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <Thumbnail
              src={bus.foto}
              className="size-11 rounded-lg border-blue-500/20 bg-blue-500/10"
              fallbackIcon={BusIcon}
              fallbackClassName="size-5 text-blue-600 dark:text-blue-400"
            />
            <div className="min-w-0 flex-1">
              <p className="font-heading text-base font-semibold leading-snug">{bus.placa}</p>
              {!sinRuta && (
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-green-500" />
                  En ruta
                </p>
              )}
            </div>
            {location.speed != null && <Velocimetro speedKmh={location.speed} />}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="shrink-0"
              onClick={onClose}
              aria-label="Cerrar"
            >
              <X className="size-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3.5">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <IconoFila icon={User} />
              Conductor
            </span>
            <span className="text-right text-sm font-semibold">
              {bus.conductor ? `${bus.conductor.nombres} ${bus.conductor.apellidos}` : 'Sin asignar'}
            </span>
          </div>

          {sinRuta ? (
            <p className="text-muted-foreground">Sin datos de ruta aún.</p>
          ) : (
            <>
              {bus.ruta && (
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <IconoFila icon={Route} />
                    Ruta
                  </span>
                  <span className="text-right text-sm font-semibold">{bus.ruta.nombre}</span>
                </div>
              )}
              {mostrarSiguientePunto && (
                <div className="flex items-start justify-between gap-3">
                  <span className="flex shrink-0 items-center gap-2.5 text-xs text-muted-foreground">
                    <IconoFila icon={MapPin} />
                    Siguiente punto
                  </span>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-right text-sm font-semibold">{siguientePunto!.nombre}</span>
                    {etaSiguiente && <EtaChip eta={etaSiguiente} />}
                  </div>
                </div>
              )}
              {direccion && (
                <div className="flex items-start justify-between gap-3">
                  <span className="flex shrink-0 items-center gap-2.5 text-xs text-muted-foreground">
                    <IconoFila icon={Flag} />
                    Próximo paradero
                  </span>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-right text-sm font-semibold">{direccion.destino.nombre}</span>
                    {etaDestino && <EtaChip eta={etaDestino} />}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
