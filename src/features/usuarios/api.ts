import { api } from '@/lib/axios'
import type { ApiResponse, User } from '@/types/api'

export async function getUsuarios() {
  const { data } = await api.get<ApiResponse<User[]>>('/usuarios')
  return data.data
}

export async function assignRole(id: number, role: string) {
  const { data } = await api.put<ApiResponse<User>>(`/usuarios/${id}/rol`, { role })
  return data.data
}
