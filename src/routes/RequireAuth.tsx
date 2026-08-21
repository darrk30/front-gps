import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/auth-store'

/**
 * Exige sesión iniciada para todo lo que cuelga de AppLayout, y fuerza el paso
 * por /cambiar-clave o /completar-perfil cuando corresponda antes de dejar
 * usar el resto de la app.
 */
export function RequireAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (user.password_temporal && location.pathname !== '/cambiar-clave') {
    return <Navigate to="/cambiar-clave" replace />
  }

  if (
    user.roles.includes('alumno') &&
    !user.alumno?.codigo &&
    location.pathname !== '/completar-perfil'
  ) {
    return <Navigate to="/completar-perfil" replace />
  }

  return <Outlet />
}
