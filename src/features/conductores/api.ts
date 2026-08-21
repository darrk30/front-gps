import { api } from '@/lib/axios'
import { toFormData } from '@/lib/forms'
import type { ApiResponse, Conductor } from '@/types/api'

export interface ConductorPayload {
  dni: string
  nombres: string
  apellidos: string
  telefono: string
  email: string
  licencia_numero: string
  licencia_categoria: string
  licencia_vencimiento: string
  activo: boolean
}

export async function getConductores() {
  const { data } = await api.get<ApiResponse<Conductor[]>>('/conductores')
  return data.data
}

export async function getConductor(id: number) {
  const { data } = await api.get<ApiResponse<Conductor>>(`/conductores/${id}`)
  return data.data
}

export async function createConductor(payload: ConductorPayload, foto?: File | null) {
  const body = foto ? toFormData({ ...payload, foto }) : payload
  const { data } = await api.post<ApiResponse<Conductor>>('/conductores', body)
  return data.data
}

export async function updateConductor(id: number, payload: ConductorPayload, foto?: File | null) {
  const body = foto ? toFormData({ ...payload, foto }) : payload
  const { data } = await api.put<ApiResponse<Conductor>>(`/conductores/${id}`, body)
  return data.data
}
