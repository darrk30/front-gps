import { api } from '@/lib/axios'
import { toFormData } from '@/lib/forms'
import type { ApiResponse, Paradero, TipoPuntoRuta } from '@/types/api'

export interface ParaderoPayload {
  nombre: string
  tipo: TipoPuntoRuta
  latitude: number
  longitude: number
  referencia: string | null
  activo: boolean
}

export async function getParaderos() {
  const { data } = await api.get<ApiResponse<Paradero[]>>('/paraderos')
  return data.data
}

export async function getParadero(id: number) {
  const { data } = await api.get<ApiResponse<Paradero>>(`/paraderos/${id}`)
  return data.data
}

export async function createParadero(payload: ParaderoPayload, foto?: File | null) {
  const body = foto ? toFormData({ ...payload, foto }) : payload
  const { data } = await api.post<ApiResponse<Paradero>>('/paraderos', body)
  return data.data
}

export async function updateParadero(id: number, payload: ParaderoPayload, foto?: File | null) {
  const body = foto ? toFormData({ ...payload, foto }) : payload
  const { data } = await api.put<ApiResponse<Paradero>>(`/paraderos/${id}`, body)
  return data.data
}
