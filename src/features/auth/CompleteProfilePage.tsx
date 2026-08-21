import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getErrorMessage, getValidationErrors } from '@/lib/axios'
import { useAuthStore } from './auth-store'
import { completeProfile } from './api'

const schema = z.object({
  codigo: z.string().min(1, 'Ingresa tu código universitario.'),
})

type FormValues = z.infer<typeof schema>

export function CompleteProfilePage() {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const mutation = useMutation({
    mutationFn: completeProfile,
    onSuccess: (updatedUser) => {
      setUser(updatedUser)
      toast.success('Perfil completado correctamente.')
      navigate('/mapa', { replace: true })
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
          <CardTitle>Completa tu perfil</CardTitle>
          <CardDescription>
            Ingresa tu código universitario para terminar de configurar tu cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={handleSubmit((values) => mutation.mutate(values))}
          >
            <div className="space-y-2">
              <Label htmlFor="codigo">Código universitario</Label>
              <Input
                id="codigo"
                autoComplete="off"
                disabled={mutation.isPending}
                {...register('codigo')}
              />
              {errors.codigo && (
                <p className="text-sm text-destructive">{errors.codigo.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Continuar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
