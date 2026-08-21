import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { KeyRound, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
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
import { getErrorMessage, getValidationErrors } from '@/lib/axios'
import { applyServerErrors } from '@/lib/forms'
import { useAuthStore } from '@/features/auth/auth-store'
import { PERMISOS } from '@/lib/permisos'
import { createAlumno, restablecerClaveAlumno, updateAlumno, type AlumnoPayload } from './api'
import { useAlumno } from './hooks'

const alumnoSchema = z.object({
  name: z.string().min(1, 'Ingresa el nombre.'),
  email: z.email('Ingresa un correo válido.'),
  codigo: z.string().min(1, 'Ingresa el código.'),
  activo: z.boolean(),
})

type AlumnoFormValues = z.infer<typeof alumnoSchema>

export function AlumnoFormPage() {
  const { id } = useParams()
  const alumnoId = id ? Number(id) : undefined
  const isEdit = alumnoId !== undefined
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const hasPermission = useAuthStore((s) => s.hasPermission)

  const alumnoQuery = useAlumno(alumnoId ?? Number.NaN)
  const [confirmarReset, setConfirmarReset] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<AlumnoFormValues>({
    resolver: zodResolver(alumnoSchema),
    defaultValues: { name: '', email: '', codigo: '', activo: true },
  })

  useEffect(() => {
    if (!alumnoQuery.data) return
    const a = alumnoQuery.data
    reset({
      name: a.name,
      email: a.email,
      // Un alumno auto-registrado con Google puede no tener código todavía
      // — el form lo tolera vacío al cargar, pero lo exige para guardar.
      codigo: a.codigo ?? '',
      activo: a.activo,
    })
  }, [alumnoQuery.data, reset])

  const mutation = useMutation({
    mutationFn: (payload: AlumnoPayload) =>
      isEdit ? updateAlumno(alumnoId as number, payload) : createAlumno(payload),
    onSuccess: () => {
      toast.success(isEdit ? 'Alumno actualizado.' : 'Alumno registrado.')
      queryClient.invalidateQueries({ queryKey: ['alumnos'] })
      navigate('/admin/alumnos')
    },
    onError: (error) => {
      applyServerErrors(setError, getValidationErrors(error))
      toast.error(getErrorMessage(error))
    },
  })

  const resetMutation = useMutation({
    mutationFn: () => restablecerClaveAlumno(alumnoId as number),
    onSuccess: () => {
      toast.success('Clave restablecida a su código actual.')
      setConfirmarReset(false)
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const isLoadingInitial = isEdit && alumnoQuery.isPending

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">{isEdit ? 'Editar alumno' : 'Nuevo alumno'}</h1>
          <p className="text-sm text-muted-foreground">
            {isEdit
              ? 'Actualiza los datos del alumno.'
              : 'Registra un alumno y su cuenta de acceso — su código funciona como contraseña inicial.'}
          </p>
        </div>
        {isEdit && hasPermission(PERMISOS.alumnosEditar) && (
          <Button type="button" variant="outline" size="sm" onClick={() => setConfirmarReset(true)}>
            <KeyRound className="size-4" />
            Restablecer clave
          </Button>
        )}
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
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input id="name" disabled={mutation.isPending} {...register('name')} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" disabled={mutation.isPending} {...register('email')} />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código de alumno</Label>
                  <Input id="codigo" disabled={mutation.isPending} {...register('codigo')} />
                  {errors.codigo ? (
                    <p className="text-sm text-destructive">{errors.codigo.message}</p>
                  ) : (
                    isEdit &&
                    alumnoQuery.data?.codigo == null && (
                      <p className="text-xs text-amber-600 dark:text-amber-500">
                        Se registró con Google y todavía no completó su código — complétalo acá.
                      </p>
                    )
                  )}
                </div>
                <div className="flex items-center gap-2 pt-2 sm:col-span-2">
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
                  <Label htmlFor="activo">Alumno activo</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={mutation.isPending}
                  onClick={() => navigate('/admin/alumnos')}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
                  {isEdit ? 'Guardar cambios' : 'Registrar alumno'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={confirmarReset} onOpenChange={setConfirmarReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Restablecer la clave de este alumno?</AlertDialogTitle>
            <AlertDialogDescription>
              Su contraseña vuelve a ser su código actual. Solo tiene efecto si inicia sesión con
              contraseña — no afecta su acceso con Google.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={resetMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction disabled={resetMutation.isPending} onClick={() => resetMutation.mutate()}>
              {resetMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Restablecer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
