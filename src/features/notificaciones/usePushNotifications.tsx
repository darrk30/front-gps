import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuthStore } from '@/features/auth/auth-store'
import { escucharPushEnPrimerPlano, solicitarTokenPush } from '@/lib/firebase'
import { registrarDispositivo } from '@/features/dispositivos/api'
import { reproducirSonidoNotificacion } from '@/lib/notificationSound'
import { iconoParaTipo } from './tipoIcono'

interface PushNotificationsState {
  activo: boolean
  activar: () => Promise<boolean>
}

const PushNotificationsContext = createContext<PushNotificationsState | null>(null)

/**
 * Notificaciones push (favoritos de alumno): al iniciar sesión intenta
 * activarlas solas (pide permiso del navegador solo si todavía no se
 * decidió — `Notification.permission === 'default'`; si ya estaba
 * concedido, `solicitarTokenPush()` no vuelve a preguntar), registra el
 * token FCM del dispositivo, y mientras la app está abierta escucha los
 * mensajes en primer plano para refrescar la campanita y avisar con un
 * toast (en segundo plano/cerrada, el service worker se encarga solo).
 *
 * Se monta una sola vez, en `PushNotificationsProvider` (ver AppLayout) —
 * cualquier otro lugar que necesite `{ activo, activar }` (ej. el toggle
 * manual en Perfil) usa `usePushNotifications()` para leer ESTA misma
 * instancia por Context, en vez de volver a montar el hook y duplicar el
 * listener de mensajes en primer plano (que mostraría el toast dos veces).
 */
export function PushNotificationsProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const esAlumno = user?.alumno != null
  const queryClient = useQueryClient()

  const [activo, setActivo] = useState(
    () => typeof Notification !== 'undefined' && Notification.permission === 'granted',
  )

  const activar = useCallback(async () => {
    const token = await solicitarTokenPush()
    if (!token) {
      setActivo(false)
      return false
    }
    try {
      await registrarDispositivo(token)
      setActivo(true)
      return true
    } catch {
      return false
    }
  }, [])

  const yaIntentado = useRef(false)
  useEffect(() => {
    if (!esAlumno || yaIntentado.current) return
    yaIntentado.current = true
    activar()
  }, [esAlumno, activar])

  useEffect(() => {
    if (!esAlumno) return
    return escucharPushEnPrimerPlano(({ titulo, mensaje, tipo }) => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] })
      reproducirSonidoNotificacion()
      const Icono = iconoParaTipo(tipo)
      toast.info(titulo ?? 'Nueva notificación', {
        description: mensaje,
        icon: <Icono className="size-4" />,
      })
    })
  }, [esAlumno, queryClient])

  return (
    <PushNotificationsContext.Provider value={{ activo, activar }}>{children}</PushNotificationsContext.Provider>
  )
}

export function usePushNotifications() {
  const ctx = useContext(PushNotificationsContext)
  if (!ctx) throw new Error('usePushNotifications debe usarse dentro de <PushNotificationsProvider>.')
  return ctx
}
