import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ImageUploadField } from '@/components/shared/ImageUploadField'
import { getErrorMessage, getValidationErrors } from '@/lib/axios'
import { applyServerErrors } from '@/lib/forms'
import { useConductores } from '@/features/conductores/hooks'
import { useRutas } from '@/features/rutas/hooks'
import { createBus, updateBus, type BusPayload } from './api'
import { useBus } from './hooks'

const SIN_ASIGNAR = 'sin_asignar'

const busSchema = z.object({
  placa: z.string().min(1, 'Ingresa la placa.'),
  capacidad: z.coerce.number('Ingresa la capacidad.').int().positive('Debe ser mayor a 0.'),
  conductor_id: z.string(),
  device_id: z.string(),
  ruta_id: z.string(),
  modelo: z.string(),
  anio: z.string(),
  color: z.string(),
  activo: z.boolean(),
})

type BusFormInput = z.input<typeof busSchema>
type BusFormValues = z.output<typeof busSchema>

function toPayload(values: BusFormValues): BusPayload {
  return {
    placa: values.placa,
    capacidad: values.capacidad,
    conductor_id: values.conductor_id === SIN_ASIGNAR ? null : Number(values.conductor_id),
    device_id: values.device_id || null,
    ruta_id: values.ruta_id === SIN_ASIGNAR ? null : Number(values.ruta_id),
    modelo: values.modelo || null,
    anio: values.anio ? Number(values.anio) : null,
    color: values.color || null,
    activo: values.activo,
  }
}

export function BusFormPage() {
  const { id } = useParams()
  const busId = id ? Number(id) : undefined
  const isEdit = busId !== undefined
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const busQuery = useBus(busId ?? Number.NaN)
  const conductoresQuery = useConductores()
  const rutasQuery = useRutas()
  const [foto, setFoto] = useState<File | null>(null)

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<BusFormInput, unknown, BusFormValues>({
    resolver: zodResolver(busSchema),
    defaultValues: {
      placa: '',
      conductor_id: SIN_ASIGNAR,
      device_id: '',
      ruta_id: SIN_ASIGNAR,
      modelo: '',
      anio: '',
      color: '',
      activo: true,
    },
  })

  useEffect(() => {
    if (!busQuery.data) return
    const b = busQuery.data
    reset({
      placa: b.placa,
      capacidad: b.capacidad,
      conductor_id: b.conductor_id ? String(b.conductor_id) : SIN_ASIGNAR,
      device_id: b.device_id ?? '',
      ruta_id: b.ruta_id ? String(b.ruta_id) : SIN_ASIGNAR,
      modelo: b.modelo ?? '',
      anio: b.anio ? String(b.anio) : '',
      color: b.color ?? '',
      activo: b.activo,
    })
  }, [busQuery.data, reset])

  const mutation = useMutation({
    mutationFn: (payload: BusPayload) =>
      isEdit ? updateBus(busId as number, payload, foto) : createBus(payload, foto),
    onSuccess: () => {
      toast.success(isEdit ? 'Bus actualizado.' : 'Bus registrado.')
      queryClient.invalidateQueries({ queryKey: ['buses'] })
      navigate('/admin/buses')
    },
    onError: (error) => {
      applyServerErrors(setError, getValidationErrors(error))
      toast.error(getErrorMessage(error))
    },
  })

  const isLoadingInitial = isEdit && busQuery.isPending

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-lg font-semibold">{isEdit ? 'Editar bus' : 'Nuevo bus'}</h1>
        <p className="text-sm text-muted-foreground">
          {isEdit ? 'Actualiza los datos del bus.' : 'Registra una nueva unidad de la flota.'}
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          {isLoadingInitial ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit((values) => mutation.mutate(toPayload(values)))}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="placa">Placa</Label>
                  <Input id="placa" disabled={mutation.isPending} {...register('placa')} />
                  {errors.placa && <p className="text-sm text-destructive">{errors.placa.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacidad">Capacidad</Label>
                  <Input
                    id="capacidad"
                    type="number"
                    disabled={mutation.isPending}
                    {...register('capacidad')}
                  />
                  {errors.capacidad && (
                    <p className="text-sm text-destructive">{errors.capacidad.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="device_id">Device ID (GPS)</Label>
                  <Input id="device_id" disabled={mutation.isPending} {...register('device_id')} />
                  {errors.device_id && (
                    <p className="text-sm text-destructive">{errors.device_id.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Conductor asignado</Label>
                  <Controller
                    control={control}
                    name="conductor_id"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={mutation.isPending || conductoresQuery.isPending}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sin asignar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={SIN_ASIGNAR}>Sin asignar</SelectItem>
                          {conductoresQuery.data?.map((conductor) => (
                            <SelectItem key={conductor.id} value={String(conductor.id)}>
                              {conductor.nombres} {conductor.apellidos}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ruta asignada</Label>
                  <Controller
                    control={control}
                    name="ruta_id"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={mutation.isPending || rutasQuery.isPending}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sin asignar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={SIN_ASIGNAR}>Sin asignar</SelectItem>
                          {rutasQuery.data?.map((ruta) => (
                            <SelectItem key={ruta.id} value={String(ruta.id)}>
                              {ruta.nombre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo</Label>
                  <Input id="modelo" disabled={mutation.isPending} {...register('modelo')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="anio">Año</Label>
                  <Input id="anio" type="number" disabled={mutation.isPending} {...register('anio')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input id="color" disabled={mutation.isPending} {...register('color')} />
                </div>
                <div className="sm:col-span-2">
                  <ImageUploadField
                    label="Foto"
                    currentUrl={busQuery.data?.foto}
                    file={foto}
                    onFileChange={setFoto}
                    disabled={mutation.isPending}
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Controller
                    control={control}
                    name="activo"
                    render={({ field }) => (
                      <Switch
                        id="activo"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={mutation.isPending}
                      />
                    )}
                  />
                  <Label htmlFor="activo">Bus activo</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={mutation.isPending}
                  onClick={() => navigate('/admin/buses')}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
                  {isEdit ? 'Guardar cambios' : 'Registrar bus'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
