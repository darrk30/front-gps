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
import { ImageUploadField } from '@/components/shared/ImageUploadField'
import { getErrorMessage, getValidationErrors } from '@/lib/axios'
import { applyServerErrors } from '@/lib/forms'
import { createConductor, updateConductor, type ConductorPayload } from './api'
import { useConductor } from './hooks'

const conductorSchema = z.object({
  dni: z.string().min(1, 'Ingresa el DNI.'),
  nombres: z.string().min(1, 'Ingresa los nombres.'),
  apellidos: z.string().min(1, 'Ingresa los apellidos.'),
  telefono: z.string().min(1, 'Ingresa el teléfono.'),
  email: z.email('Ingresa un correo válido.'),
  licencia_numero: z.string().min(1, 'Ingresa el número de licencia.'),
  licencia_categoria: z.string().min(1, 'Ingresa la categoría de licencia.'),
  licencia_vencimiento: z.string().min(1, 'Ingresa la fecha de vencimiento.'),
  activo: z.boolean(),
})

type ConductorFormValues = z.infer<typeof conductorSchema>

/** La API devuelve/espera fechas en formatos distintos: dd/mm/yyyy al leer, yyyy-mm-dd al enviar. */
function toInputDate(value: string) {
  const [d, m, y] = value.split('/')
  if (!d || !m || !y) return ''
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

export function ConductorFormPage() {
  const { id } = useParams()
  const conductorId = id ? Number(id) : undefined
  const isEdit = conductorId !== undefined
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const conductorQuery = useConductor(conductorId ?? Number.NaN)
  const [foto, setFoto] = useState<File | null>(null)

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ConductorFormValues>({
    resolver: zodResolver(conductorSchema),
    defaultValues: { activo: true },
  })

  useEffect(() => {
    if (!conductorQuery.data) return
    const c = conductorQuery.data
    reset({
      dni: c.dni,
      nombres: c.nombres,
      apellidos: c.apellidos,
      telefono: c.telefono ?? '',
      email: c.email,
      licencia_numero: c.licencia_numero,
      licencia_categoria: c.licencia_categoria,
      licencia_vencimiento: toInputDate(c.licencia_vencimiento),
      activo: c.activo,
    })
  }, [conductorQuery.data, reset])

  const mutation = useMutation({
    mutationFn: (payload: ConductorPayload) =>
      isEdit
        ? updateConductor(conductorId as number, payload, foto)
        : createConductor(payload, foto),
    onSuccess: () => {
      toast.success(isEdit ? 'Conductor actualizado.' : 'Conductor registrado.')
      queryClient.invalidateQueries({ queryKey: ['conductores'] })
      navigate('/admin/conductores')
    },
    onError: (error) => {
      applyServerErrors(setError, getValidationErrors(error))
      toast.error(getErrorMessage(error))
    },
  })

  const isLoadingInitial = isEdit && conductorQuery.isPending

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-lg font-semibold">
          {isEdit ? 'Editar conductor' : 'Nuevo conductor'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEdit
            ? 'Actualiza los datos del conductor.'
            : 'Registra un nuevo conductor y su cuenta de acceso.'}
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          {isLoadingInitial ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dni">DNI</Label>
                  <Input id="dni" disabled={mutation.isPending} {...register('dni')} />
                  {errors.dni && <p className="text-sm text-destructive">{errors.dni.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input id="telefono" disabled={mutation.isPending} {...register('telefono')} />
                  {errors.telefono && (
                    <p className="text-sm text-destructive">{errors.telefono.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nombres">Nombres</Label>
                  <Input id="nombres" disabled={mutation.isPending} {...register('nombres')} />
                  {errors.nombres && (
                    <p className="text-sm text-destructive">{errors.nombres.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellidos">Apellidos</Label>
                  <Input id="apellidos" disabled={mutation.isPending} {...register('apellidos')} />
                  {errors.apellidos && (
                    <p className="text-sm text-destructive">{errors.apellidos.message}</p>
                  )}
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" disabled={mutation.isPending} {...register('email')} />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licencia_numero">N° de licencia</Label>
                  <Input
                    id="licencia_numero"
                    disabled={mutation.isPending}
                    {...register('licencia_numero')}
                  />
                  {errors.licencia_numero && (
                    <p className="text-sm text-destructive">{errors.licencia_numero.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licencia_categoria">Categoría de licencia</Label>
                  <Input
                    id="licencia_categoria"
                    placeholder="A-IIa"
                    disabled={mutation.isPending}
                    {...register('licencia_categoria')}
                  />
                  {errors.licencia_categoria && (
                    <p className="text-sm text-destructive">{errors.licencia_categoria.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licencia_vencimiento">Vencimiento de licencia</Label>
                  <Input
                    id="licencia_vencimiento"
                    type="date"
                    disabled={mutation.isPending}
                    {...register('licencia_vencimiento')}
                  />
                  {errors.licencia_vencimiento && (
                    <p className="text-sm text-destructive">{errors.licencia_vencimiento.message}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <ImageUploadField
                    label="Foto"
                    currentUrl={conductorQuery.data?.foto}
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
                  <Label htmlFor="activo">Conductor activo</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={mutation.isPending}
                  onClick={() => navigate('/admin/conductores')}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
                  {isEdit ? 'Guardar cambios' : 'Registrar conductor'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
