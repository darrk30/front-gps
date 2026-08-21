import { api } from '@/lib/axios'
import type { ApiResponse, Permiso, Role, RoleDetalle } from '@/types/api'

export interface RolePayload {
  name: string
  permissions: string[]
}

export async function getRoles() {
  const { data } = await api.get<ApiResponse<Role[]>>('/roles')
  return data.data
}

export async function getRole(id: number) {
  const { data } = await api.get<ApiResponse<RoleDetalle>>(`/roles/${id}`)
  return data.data
}

export async function getPermisos() {
  const { data } = await api.get<ApiResponse<Permiso[]>>('/permisos')
  return data.data
}

export async function createRole(payload: RolePayload) {
  const { data } = await api.post<ApiResponse<Role>>('/roles', payload)
  return data.data
}

export async function updateRole(id: number, payload: RolePayload) {
  const { data } = await api.put<ApiResponse<Role>>(`/roles/${id}`, payload)
  return data.data
}
