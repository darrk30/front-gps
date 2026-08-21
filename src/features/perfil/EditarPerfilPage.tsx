import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { getErrorMessage, getValidationErrors } from '@/lib/axios'
import { useAuthStore } from '@/features/auth/auth-store'
import { completeProfile } from '@/features/auth/api'

const schema = z.object({
  codigo: z.string().min(1, 'Ingresa tu código universitario.'),
})

type FormValues = z.infer<typeof schema>

export function EditarPerfilPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { codigo: user?.alumno?.codigo ?? '' },
  })

  const mutation = useMutation({
    mutationFn: completeProfile,
    onSuccess: (updatedUser) => {
      setUser(updatedUser)
      toast.success('Perfil actualizado.')
      navigate('/perfil', { replace: true })
    },
    onError: (error) => {
      const validation = getValidationErrors(error)
      for (const [field, messages] of Object.entries(validation)) {
        setError(field as keyof FormValues, { message: messages[0] })
      }
      if (Object.keys(validation).length === 0) toast.error(getErrorMessage(error))
    },
  })

  const esAlumno = user?.alumno != null

  return (
    <div className="mx-auto max-w-xl space-y-4 p-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/perfil">
          <ArrowLeft className="size-4" />
          Perfil
        </Link>
      </Button>

      <h1 className="text-lg font-semibold">Editar perfil</h1>

      <Card>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input value={user?.name ?? ''} disabled />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email ?? ''} disabled />
          </div>

          {esAlumno ? (
            <form className="space-y-4" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
              <div className="space-y-2">
                <Label htmlFor="codigo">Código universitario</Label>
                <Input id="codigo" autoComplete="off" disabled={mutation.isPending} {...register('codigo')} />
                {errors.codigo && <p className="text-sm text-destructive">{errors.codigo.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
                Guardar cambios
              </Button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">
              Tu nombre y correo se gestionan desde tu cuenta institucional — no hay otros datos para
              editar acá.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
