import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getNotificaciones, marcarLeida, marcarTodasLeidas } from './api'

export function useNotificaciones() {
  // El push en primer plano (ver usePushNotifications) invalida esta query
  // apenas llega, pero SOLO dispara si la pestaña está enfocada en ese
  // momento exacto — si el push llegó con la pestaña en segundo plano (el
  // service worker la maneja aparte), o con otra pestaña activa, nunca se
  // invalida. `refetchOnWindowFocus` está en false a nivel global, así que
  // sin este polling la campanita se queda desactualizada hasta un F5.
  return useQuery({
    queryKey: ['notificaciones'],
    queryFn: getNotificaciones,
    refetchInterval: 30_000,
  })
}

export function useMarcarLeida() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: marcarLeida,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notificaciones'] }),
  })
}

export function useMarcarTodasLeidas() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: marcarTodasLeidas,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notificaciones'] }),
  })
}
