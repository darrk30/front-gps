import { useAuthStore } from '@/features/auth/auth-store'
import { AppLayout } from '@/layouts/AppLayout'
import { NotFoundPage } from './NotFoundPage'

/**
 * Ruta comodín ("*"). No se puede resolver con dos `path: '*'` (uno bajo
 * GuestOnly, otro bajo RequireAuth) porque el matching de rutas es puramente
 * estructural y ambos comodines empatarían en especificidad — el router
 * elegiría uno fijo sin importar la sesión. Por eso la sesión se chequea acá
 * en JS: logueado ve el 404 con el menú de la app (AppLayout), sin loguear ve
 * la página sola.
 */
export function CatchAllRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (isAuthenticated) {
    return (
      <AppLayout>
        <NotFoundPage className="min-h-[calc(100svh-3.5rem)]" />
      </AppLayout>
    )
  }

  return <NotFoundPage />
}
