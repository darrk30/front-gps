import { useEffect, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from './auth-store'
import { me } from './api'

/**
 * Al cargar la app, si hay un token persistido revalida contra /auth/me
 * para refrescar roles/permissions y detectar tokens expirados/inválidos
 * (el interceptor de axios ya limpia la sesión ante un 401).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token)
  const setUser = useAuthStore((s) => s.setUser)
  const logout = useAuthStore((s) => s.logout)

  const { data, isFetching, isError } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: me,
    enabled: !!token,
    retry: false,
  })

  useEffect(() => {
    if (data) setUser(data)
  }, [data, setUser])

  useEffect(() => {
    if (isError) logout()
  }, [isError, logout])

  if (token && isFetching) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return children
}
