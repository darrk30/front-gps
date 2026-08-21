import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  AlertCircle,
  ArrowLeft,
  Check,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { getErrorMessage } from '@/lib/axios'
import { useAuthStore } from '@/features/auth/auth-store'
import { PERMISOS } from '@/lib/permisos'
import { useParaderos } from '@/features/paraderos/hooks'
import type { PuntoRuta } from '@/types/api'
import { addPuntoRuta, removePuntoRuta, updatePuntoRuta, type RutaPuntoPayload } from './api'
import { useRuta } from './hooks'

function TipoBadge({ tipo }: { tipo: PuntoRuta['tipo'] }) {
  return tipo === 'paradero' ? (
    <Badge className="bg-blue-500 text-white hover:bg-blue-500/90">Paradero</Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground">
      Parada
    </Badge>
  )
}

const puntoSchema = z.object({
  paradero_id: z.string().min(1, 'Selecciona un paradero.'),
  orden: z.coerce.number('Ingresa el orden.').int().min(1, 'Debe ser mayor o igual a 1.'),
})

type PuntoFormInput = z.input<typeof puntoSchema>
type PuntoFormValues = z.output<typeof puntoSchema>

/**
 * Fila arrastrable de la tabla. El agarre (ícono de grip) es el único punto
 * de la fila con `touch-action: none` — así el resto de la fila sigue
 * scrolleando normal en móvil y solo el drag handle inicia el arrastre,
 * tanto con mouse como con touch (dnd-kit unifica ambos vía Pointer Events).
 */
function SortableRow({
  punto,
  disabled,
  children,
}: {
  punto: PuntoRuta
  disabled: boolean
  children: React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: punto.id,
    disabled,
  })

  return (
    <TableRow
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && 'relative z-10 bg-muted shadow-md')}
    >
      <TableCell className="w-10 px-1">
        {!disabled && (
          <button
            type="button"
            className="flex size-7 cursor-grab touch-none items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
            aria-label="Arrastrar para reordenar"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </button>
        )}
      </TableCell>
      {children}
    </TableRow>
  )
}

export function RutaPuntosPage() {
  const { id } = useParams()
  const rutaId = Number(id)

  const rutaQuery = useRuta(rutaId)
  const paraderosQuery = useParaderos()
  const queryClient = useQueryClient()
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const puedeEditar = hasPermission(PERMISOS.rutasEditar)

  const [editando, setEditando] = useState<PuntoRuta | null>(null)
  const [aEliminar, setAEliminar] = useState<PuntoRuta | null>(null)

  // Copia local editable para poder reflejar el arrastre al instante (antes
  // de que el backend confirme) — se resincroniza cada vez que llega data
  // nueva del servidor (carga inicial, o después de guardar/invalidar).
  const [puntos, setPuntos] = useState<PuntoRuta[]>([])
  useEffect(() => {
    if (rutaQuery.data) {
      setPuntos([...rutaQuery.data.puntos].sort((a, b) => a.orden - b.orden))
    }
  }, [rutaQuery.data])

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PuntoFormInput, unknown, PuntoFormValues>({
    resolver: zodResolver(puntoSchema),
    defaultValues: { paradero_id: '', orden: undefined },
  })

  useEffect(() => {
    if (editando) {
      reset({ paradero_id: String(editando.paradero.id), orden: editando.orden })
    } else {
      reset({ paradero_id: '', orden: (puntos.at(-1)?.orden ?? 0) + 1 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editando])

  const paraderosDisponibles = useMemo(() => {
    const usados = new Set(puntos.map((p) => p.paradero.id))
    if (editando) usados.delete(editando.paradero.id)
    return (paraderosQuery.data ?? []).filter((p) => !usados.has(p.id))
  }, [paraderosQuery.data, puntos, editando])

  const mutation = useMutation({
    mutationFn: (payload: RutaPuntoPayload) =>
      editando
        ? updatePuntoRuta(rutaId, editando.id, payload)
        : addPuntoRuta(rutaId, payload),
    onSuccess: () => {
      toast.success(editando ? 'Punto actualizado.' : 'Punto agregado.')
      queryClient.invalidateQueries({ queryKey: ['rutas', rutaId] })
      setEditando(null)
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const eliminarMutation = useMutation({
    mutationFn: (punto: PuntoRuta) => removePuntoRuta(rutaId, punto.id),
    onSuccess: () => {
      toast.success('Punto quitado de la ruta.')
      queryClient.invalidateQueries({ queryKey: ['rutas', rutaId] })
      setAEliminar(null)
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  /**
   * `orden` es único por ruta en el backend, así que no se puede simplemente
   * reasignar 1..N de una — dos puntos podrían "cruzarse" por un instante y
   * chocar contra esa restricción. Primero se corren los puntos afectados a
   * un rango temporal muy por encima de cualquier orden existente (nunca
   * choca con nada), y recién después se les pone su orden final.
   */
  const reorderMutation = useMutation({
    mutationFn: async (nuevoOrden: PuntoRuta[]) => {
      const cambios = nuevoOrden
        .map((punto, i) => ({ punto, ordenNuevo: i + 1 }))
        .filter((c) => c.ordenNuevo !== c.punto.orden)
      if (cambios.length === 0) return

      const maxOrden = Math.max(...nuevoOrden.map((p) => p.orden), 0)
      for (const [i, c] of cambios.entries()) {
        await updatePuntoRuta(rutaId, c.punto.id, {
          paradero_id: c.punto.paradero.id,
          orden: maxOrden + 1000 + i,
        })
      }
      for (const c of cambios) {
        await updatePuntoRuta(rutaId, c.punto.id, {
          paradero_id: c.punto.paradero.id,
          orden: c.ordenNuevo,
        })
      }
    },
    onSuccess: () => {
      toast.success('Orden guardado.')
      queryClient.invalidateQueries({ queryKey: ['rutas', rutaId] })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
      queryClient.invalidateQueries({ queryKey: ['rutas', rutaId] })
    },
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  /**
   * Arrastrar solo reordena en memoria — no guarda nada todavía. Antes cada
   * suelte disparaba de inmediato un PUT al backend, así que si se querían
   * mover varias filas seguidas, el arrastre se bloqueaba hasta que el
   * anterior terminara de guardar. Ahora se puede reordenar todo lo que se
   * quiera libremente y recién se persiste con el botón "Guardar orden".
   * OJO: `orden` de cada punto NO se toca acá — reorderMutation compara ese
   * valor original contra la posición final para saber qué cambió al guardar.
   */
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = puntos.findIndex((p) => p.id === active.id)
    const newIndex = puntos.findIndex((p) => p.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    setPuntos(arrayMove(puntos, oldIndex, newIndex))
  }

  const ordenOriginal = useMemo(
    () => (rutaQuery.data ? [...rutaQuery.data.puntos].sort((a, b) => a.orden - b.orden) : []),
    [rutaQuery.data],
  )
  const ordenModificado =
    puntos.length === ordenOriginal.length &&
    puntos.some((p, i) => p.id !== ordenOriginal[i]?.id)

  function descartarOrden() {
    setPuntos(ordenOriginal)
  }

  /**
   * `reorderMutation.isPending` (usado en `disabled`) solo se actualiza en
   * el próximo render — si el botón recibe dos clics dentro del mismo tick
   * (doble clic real, o el doble evento click/touchend típico en móvil),
   * ambos alcanzan a leer `isPending: false` y el flujo completo de guardado
   * corre dos veces (cada punto cambiado termina recibiendo el doble de PUTs
   * al backend). Este ref se marca de forma síncrona apenas se procesa el
   * primer clic, así el segundo se ignora sin depender de un re-render.
   */
  const guardandoRef = useRef(false)
  function guardarOrden() {
    if (guardandoRef.current) return
    guardandoRef.current = true
    reorderMutation.mutate(puntos, { onSettled: () => (guardandoRef.current = false) })
  }

  function onSubmit(values: PuntoFormValues) {
    mutation.mutate({ paradero_id: Number(values.paradero_id), orden: values.orden })
  }

  const isLoading = rutaQuery.isPending
  const guardandoOrden = reorderMutation.isPending
  const arrastreDeshabilitado = !puedeEditar || guardandoOrden
  // Mientras hay un reordenamiento sin guardar, se bloquean agregar/editar/
  // quitar puntos: esas acciones van directo al backend con el `orden` que
  // el servidor todavía tiene, y podrían chocar con el reordenamiento
  // pendiente (o guardarse con un `orden` que ya no refleja lo que se ve en
  // pantalla).
  const accionesBloqueadas = ordenModificado || guardandoOrden

  return (
    <div className="space-y-4 p-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-1">
          <Link to="/admin/rutas">
            <ArrowLeft className="size-4" />
            Rutas
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">
          {isLoading ? 'Cargando ruta...' : `Puntos de "${rutaQuery.data?.nombre}"`}
        </h1>
        <p className="text-sm text-muted-foreground">
          Secuencia ordenada de paraderos que sigue esta ruta. Arrastra el ícono{' '}
          <GripVertical className="inline size-3.5 align-text-bottom" /> de una fila para cambiar
          su orden y confirma con "Guardar orden".
        </p>
      </div>

      {rutaQuery.isError && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {getErrorMessage(rutaQuery.error)}
        </div>
      )}

      {puedeEditar && (
        <Card className="max-w-2xl">
          <CardContent className="space-y-3 pt-6">
            {ordenModificado && (
              <p className="text-xs text-amber-600 dark:text-amber-500">
                Tienes un reordenamiento sin guardar — guárdalo o descártalo antes de agregar,
                editar o quitar puntos.
              </p>
            )}
            <form
              className="grid items-end gap-4 sm:grid-cols-[1fr_auto_auto_auto]"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="space-y-2">
                <Label>Paradero</Label>
                <Controller
                  control={control}
                  name="paradero_id"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={mutation.isPending || paraderosQuery.isPending || accionesBloqueadas}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un paradero" />
                      </SelectTrigger>
                      <SelectContent>
                        {paraderosDisponibles.map((paradero) => (
                          <SelectItem key={paradero.id} value={String(paradero.id)}>
                            {paradero.nombre} ({paradero.tipo})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.paradero_id && (
                  <p className="text-sm text-destructive">{errors.paradero_id.message}</p>
                )}
              </div>

              <div className="w-24 space-y-2">
                <Label htmlFor="orden">Orden</Label>
                <Input
                  id="orden"
                  type="number"
                  disabled={mutation.isPending || accionesBloqueadas}
                  {...register('orden')}
                />
                {errors.orden && <p className="text-sm text-destructive">{errors.orden.message}</p>}
              </div>

              <Button type="submit" disabled={mutation.isPending || accionesBloqueadas}>
                {mutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : editando ? (
                  <Pencil className="size-4" />
                ) : (
                  <Plus className="size-4" />
                )}
                {editando ? 'Guardar' : 'Agregar'}
              </Button>

              {editando && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={mutation.isPending}
                  onClick={() => setEditando(null)}
                >
                  <X className="size-4" />
                  Cancelar
                </Button>
              )}
            </form>
          </CardContent>
        </Card>
      )}

      {puedeEditar && ordenModificado && (
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" disabled={guardandoOrden} onClick={guardarOrden}>
            {guardandoOrden ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            Guardar orden
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={guardandoOrden}
            onClick={descartarOrden}
          >
            <RotateCcw className="size-4" />
            Descartar cambios
          </Button>
        </div>
      )}

      {/*
        DndContext debe envolver la tabla entera, no ir adentro de <tbody>:
        internamente renderiza un <div> oculto para anuncios de accesibilidad,
        y un <div> no puede ser hijo directo de <tbody> (error de nesting/
        hidratación). SortableContext en cambio no renderiza ningún elemento
        propio, así que ese sí puede ir directo dentro del <tbody>.
      */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead className="w-16">Orden</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Coordenadas</TableHead>
                {puedeEditar && <TableHead className="w-20" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={puedeEditar ? 6 : 5} className="text-center">
                    <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && puntos.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={puedeEditar ? 6 : 5}
                    className="text-center text-sm text-muted-foreground"
                  >
                    Esta ruta todavía no tiene paraderos.
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && puntos.length > 0 && (
                <SortableContext
                  items={puntos.map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {puntos.map((punto, i) => (
                    <SortableRow key={punto.id} punto={punto} disabled={arrastreDeshabilitado}>
                      <TableCell className="font-medium">{i + 1}</TableCell>
                      <TableCell>{punto.nombre}</TableCell>
                      <TableCell>
                        <TipoBadge tipo={punto.tipo} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {punto.latitude.toFixed(5)}, {punto.longitude.toFixed(5)}
                      </TableCell>
                      {puedeEditar && (
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              disabled={accionesBloqueadas}
                              onClick={() => setEditando(punto)}
                              aria-label="Editar punto"
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive hover:text-destructive"
                              disabled={accionesBloqueadas}
                              onClick={() => setAEliminar(punto)}
                              aria-label="Quitar punto"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </SortableRow>
                  ))}
                </SortableContext>
              )}
            </TableBody>
          </Table>
        </div>
      </DndContext>

      <AlertDialog open={aEliminar != null} onOpenChange={(open) => !open && setAEliminar(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Quitar "{aEliminar?.nombre}" de la ruta?</AlertDialogTitle>
            <AlertDialogDescription>
              Solo se quita de esta ruta — el paradero en sí no se elimina.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={eliminarMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={eliminarMutation.isPending}
              onClick={() => aEliminar && eliminarMutation.mutate(aEliminar)}
            >
              {eliminarMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Quitar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
