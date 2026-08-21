import { useEffect } from 'react'
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
import { getErrorMessage, getValidationErrors } from '@/lib/axios'
import { applyServerErrors } from '@/lib/forms'
import { createRuta, updateRuta, type RutaPayload } from './api'
import { useRuta } from './hooks'

const rutaSchema = z.object({
  nombre: z.string().min(1, 'Ingresa el nombre.'),
  activo: z.boolean(),
})

type RutaFormValues = z.infer<typeof rutaSchema>

export function RutaFormPage() {
  const { id } = useParams()
  const rutaId = id ? Number(id) : undefined
  const isEdit = rutaId !== undefined
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const rutaQuery = useRuta(rutaId)

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<RutaFormValues>({
    resolver: zodResolver(rutaSchema),
    defaultValues: { nombre: '', activo: true },
  })

  useEffect(() => {
    if (!rutaQuery.data) return
    reset({ nombre: rutaQuery.data.nombre, activo: rutaQuery.data.activo })
  }, [rutaQuery.data, reset])

  const mutation = useMutation({
    mutationFn: (payload: RutaPayload) =>
      isEdit ? updateRuta(rutaId as number, payload) : createRuta(payload),
    onSuccess: () => {
      toast.success(isEdit ? 'Ruta actualizada.' : 'Ruta registrada.')
      queryClient.invalidateQueries({ queryKey: ['rutas'] })
      navigate('/admin/rutas')
    },
    onError: (error) => {
      applyServerErrors(setError, getValidationErrors(error))
      toast.error(getErrorMessage(error))
    },
  })

  const isLoadingInitial = isEdit && rutaQuery.isPending

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-lg font-semibold">{isEdit ? 'Editar ruta' : 'Nueva ruta'}</h1>
        <p className="text-sm text-muted-foreground">
          {isEdit
            ? 'Actualiza el nombre o estado de la ruta.'
            : 'Crea la ruta; luego agrégale sus paraderos en orden desde "Gestionar puntos".'}
        </p>
      </div>

      <Card className="max-w-lg">
        <CardContent className="pt-6">
          {isLoadingInitial ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <form
              className="space-y-4"
              onSubmit={handleSubmit((values) => mutation.mutate(values))}
            >
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input id="nombre" disabled={mutation.isPending} {...register('nombre')} />
                {errors.nombre && (
                  <p className="text-sm text-destructive">{errors.nombre.message}</p>
                )}
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
                <Label htmlFor="activo">Ruta activa</Label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={mutation.isPending}
                  onClick={() => navigate('/admin/rutas')}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
                  {isEdit ? 'Guardar cambios' : 'Crear ruta'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
