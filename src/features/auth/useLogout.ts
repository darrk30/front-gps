import { useNavigate } from 'react-router-dom'
import { useAuthStore } from './auth-store'
import { logout as logoutApi } from './api'
import { solicitarTokenPush } from '@/lib/firebase'
import { eliminarDispositivo } from '@/features/dispositivos/api'

/**
 * Cierre de sesión compartido entre el dropdown del header y la página de
 * Perfil — además de invalidar el token JWT, intenta (best-effort, sin
 * bloquear el logout si falla) dar de baja el token push de este navegador,
 * para que deje de recibir notificaciones de un usuario que ya no es el
 * dueño de la sesión acá.
 */
export function useLogout() {
  const navigate = useNavigate()
  const logoutStore = useAuthStore((s) => s.logout)

  return async function cerrarSesion() {
    try {
      const token = await solicitarTokenPush()
      if (token) await eliminarDispositivo(token)
    } catch {
      // best-effort
    }
    try {
      await logoutApi()
    } catch {
      // el token puede ya estar vencido; igual limpiamos la sesión local
    }
    logoutStore()
    navigate('/login', { replace: true })
  }
}
