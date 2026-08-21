import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/auth-store'

/** Evita que un usuario ya logueado vuelva a ver /login. */
export function GuestOnly() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/mapa" replace />
  }

  return <Outlet />
}
