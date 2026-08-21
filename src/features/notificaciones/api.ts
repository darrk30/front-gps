import { api } from '@/lib/axios'
import type { ApiResponse, Notificacion } from '@/types/api'

export async function getNotificaciones() {
  const { data } = await api.get<ApiResponse<Notificacion[]>>('/notificaciones')
  return data.data
}

export async function marcarLeida(id: number) {
  const { data } = await api.patch<ApiResponse<Notificacion>>(`/notificaciones/${id}/leer`)
  return data.data
}

export async function marcarTodasLeidas() {
  await api.patch<ApiResponse<null>>('/notificaciones/leer-todas')
}
