import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getErrorMessage, getValidationErrors } from '@/lib/axios'
import { useAuthStore } from './auth-store'
import { changePassword } from './api'

const schema = z
  .object({
    current_password: z.string().min(1, 'Ingresa tu contraseña actual.'),
    password: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres.'),
    password_confirmation: z.string().min(1, 'Confirma tu nueva contraseña.'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Las contraseñas no coinciden.',
    path: ['password_confirmation'],
  })

type FormValues = z.infer<typeof schema>

export function ChangePasswordPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: (updatedUser) => {
      setUser(updatedUser)
      toast.success('Contraseña actualizada correctamente.')

      if (user?.roles.includes('alumno') && !updatedUser.alumno?.codigo) {
        navigate('/completar-perfil', { replace: true })
      } else {
        navigate('/mapa', { replace: true })
      }
    },
    onError: (error) => {
      const validation = getValidationErrors(error)
      for (const [field, messages] of Object.entries(validation)) {
        setError(field as keyof FormValues, { message: messages[0] })
      }
      if (Object.keys(validation).length === 0) toast.error(getErrorMessage(error))
    },
  })

  return (
    <div className="mx-auto flex min-h-[calc(100svh-3.5rem)] max-w-sm items-center justify-center p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Cambia tu contraseña</CardTitle>
          <CardDescription>
            Por seguridad debes establecer una nueva contraseña antes de continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={handleSubmit((values) => mutation.mutate(values))}
          >
            <div className="space-y-2">
              <Label htmlFor="current_password">Contraseña actual</Label>
              <PasswordInput
                id="current_password"
                autoComplete="current-password"
                disabled={mutation.isPending}
                {...register('current_password')}
              />
              {errors.current_password && (
                <p className="text-sm text-destructive">{errors.current_password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Nueva contraseña</Label>
              <PasswordInput
                id="password"
                autoComplete="new-password"
                disabled={mutation.isPending}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Confirmar nueva contraseña</Label>
              <PasswordInput
                id="password_confirmation"
                autoComplete="new-password"
                disabled={mutation.isPending}
                {...register('password_confirmation')}
              />
              {errors.password_confirmation && (
                <p className="text-sm text-destructive">
                  {errors.password_confirmation.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Guardar contraseña
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
