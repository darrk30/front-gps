import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { PermissionsChecklist } from '@/components/shared/PermissionsChecklist'
import { getErrorMessage, getValidationErrors } from '@/lib/axios'
import { applyServerErrors } from '@/lib/forms'
import { ROLES_PROTEGIDOS } from '@/lib/permisos'
import { createRole, updateRole, type RolePayload } from './api'
import { usePermisos, useRole } from './hooks'

const roleSchema = z.object({
  name: z.string().min(1, 'Ingresa el nombre del rol.'),
})

type RoleFormValues = z.infer<typeof roleSchema>

export function RoleFormPage() {
  const { id } = useParams()
  const roleId = id ? Number(id) : undefined
  const isEdit = roleId !== undefined
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const roleQuery = useRole(roleId ?? Number.NaN)
  const permisosQuery = usePermisos()
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<string[]>([])

  const esProtegido = isEdit && ROLES_PROTEGIDOS.includes(roleQuery.data?.name ?? '')

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<RoleFormValues>({ resolver: zodResolver(roleSchema) })

  useEffect(() => {
    if (!roleQuery.data) return
    reset({ name: roleQuery.data.name })
    setPermisosSeleccionados(
      roleQuery.data.permissions.filter((p) => p.asignado).map((p) => p.name),
    )
  }, [roleQuery.data, reset])

  function togglePermiso(name: string, checked: boolean) {
    setPermisosSeleccionados((current) =>
      checked ? [...current, name] : current.filter((p) => p !== name),
    )
  }

  const mutation = useMutation({
    mutationFn: (payload: RolePayload) =>
      isEdit ? updateRole(roleId as number, payload) : createRole(payload),
    onSuccess: () => {
      toast.success(isEdit ? 'Rol actualizado.' : 'Rol creado.')
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      navigate('/admin/roles')
    },
    onError: (error) => {
      applyServerErrors(setError, getValidationErrors(error))
      toast.error(getErrorMessage(error))
    },
  })

  function onSubmit(values: RoleFormValues) {
    mutation.mutate({ name: values.name, permissions: permisosSeleccionados })
  }

  const isLoadingInitial = (isEdit && roleQuery.isPending) || permisosQuery.isPending

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-lg font-semibold">{isEdit ? 'Editar rol' : 'Nuevo rol'}</h1>
        <p className="text-sm text-muted-foreground">
          {isEdit
            ? 'Actualiza el nombre y los permisos del rol.'
            : 'Crea un rol y define qué permisos otorga.'}
        </p>
      </div>

      <Card className="max-w-3xl">
        <CardContent className="pt-6">
          {isLoadingInitial ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="max-w-sm space-y-2">
                <Label htmlFor="name">Nombre del rol</Label>
                <Input
                  id="name"
                  disabled={mutation.isPending || esProtegido}
                  {...register('name')}
                />
                {esProtegido && (
                  <p className="text-xs text-muted-foreground">
                    Este rol es parte del sistema y no se puede renombrar.
                  </p>
                )}
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Permisos</Label>
                <PermissionsChecklist
                  permisos={permisosQuery.data ?? []}
                  selected={permisosSeleccionados}
                  onToggle={togglePermiso}
                  disabled={mutation.isPending}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={mutation.isPending}
                  onClick={() => navigate('/admin/roles')}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
                  {isEdit ? 'Guardar cambios' : 'Crear rol'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
