import { Outlet } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { useAuthStore } from '@/features/auth/auth-store'

/**
 * Exige un permiso puntual para acceder a las rutas hijas. La seguridad real
 * ya la aplica el backend (403); esto es solo para no exponer secciones que
 * el usuario no podría usar de todas formas.
 */
export function ProtectedRoute({ permiso }: { permiso: string }) {
  const permitido = useAuthStore((s) => s.hasPermission(permiso))

  if (!permitido) {
    return (
      <div className="flex h-full min-h-[calc(100svh-3.5rem)] flex-col items-center justify-center gap-2 text-muted-foreground">
        <ShieldAlert className="size-8" />
        <p className="text-sm">No tienes permiso para acceder a esta sección.</p>
      </div>
    )
  }

  return <Outlet />
}
