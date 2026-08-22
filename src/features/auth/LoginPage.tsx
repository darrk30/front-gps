import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { GoogleLogin } from '@react-oauth/google'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { getErrorMessage } from '@/lib/axios'
import { useAuthStore } from './auth-store'
import { login, loginWithGoogle } from './api'
import type { AuthResponse } from './types'

const loginSchema = z.object({
  email: z.email('Ingresa un correo válido.'),
  password: z.string().min(1, 'Ingresa tu contraseña.'),
})

type LoginFormValues = z.infer<typeof loginSchema>

const hasGoogleAuth = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)

export function LoginPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const [googleLoading, setGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  function handleAuthSuccess({ user, access_token }: AuthResponse) {
    setSession(user, access_token)

    if (user.password_temporal) {
      navigate('/cambiar-clave', { replace: true })
    } else if (user.roles.includes('alumno') && !user.alumno?.codigo) {
      navigate('/completar-perfil', { replace: true })
    } else {
      navigate('/mapa', { replace: true })
    }
  }

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: handleAuthSuccess,
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  const googleMutation = useMutation({
    mutationFn: loginWithGoogle,
    onSuccess: handleAuthSuccess,
    onError: (error) => toast.error(getErrorMessage(error)),
    onSettled: () => setGoogleLoading(false),
  })

  return (
    <Card>
      <CardContent className="space-y-5 pt-6">
        <form
          className="space-y-4"
          onSubmit={handleSubmit((values) => loginMutation.mutate(values))}
        >
          <div className="space-y-2">
            <Label htmlFor="email">Correo institucional</Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@unprg.edu.pe"
              autoComplete="email"
              disabled={loginMutation.isPending}
              {...register('email')}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              disabled={loginMutation.isPending}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
            {loginMutation.isPending && <Loader2 className="size-4 animate-spin" />}
            Ingresar
          </Button>
        </form>

        {hasGoogleAuth && (
          <>
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">o</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="space-y-2">
              <p className="text-center text-xs text-muted-foreground">
                Ingresa con tu cuenta institucional de la UNPRG — si es tu primera vez, se registra sola.
              </p>
              <div className="flex justify-center">
                {googleLoading ? (
                  <div className="flex h-10 items-center justify-center">
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <GoogleLogin
                    text="continue_with"
                    onSuccess={(credentialResponse) => {
                      if (!credentialResponse.credential) {
                        toast.error('No se pudo obtener la credencial de Google.')
                        return
                      }
                      setGoogleLoading(true)
                      googleMutation.mutate({ token: credentialResponse.credential })
                    }}
                    onError={() => toast.error('No se pudo iniciar sesión con Google.')}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
