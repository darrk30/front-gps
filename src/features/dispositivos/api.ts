import { api } from '@/lib/axios'
import type { ApiResponse } from '@/types/api'

export async function registrarDispositivo(token: string) {
  await api.post<ApiResponse<null>>('/dispositivos', { token, plataforma: 'web' })
}

export async function eliminarDispositivo(token: string) {
  await api.delete<ApiResponse<null>>('/dispositivos', { data: { token } })
}
