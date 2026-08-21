import { api } from '@/lib/axios'
import { toFormData } from '@/lib/forms'
import type { ApiResponse, Bus } from '@/types/api'

export interface BusPayload {
  placa: string
  capacidad: number
  conductor_id: number | null
  device_id: string | null
  ruta_id: number | null
  modelo: string | null
  anio: number | null
  color: string | null
  activo: boolean
}

export async function getBuses() {
  const { data } = await api.get<ApiResponse<Bus[]>>('/buses')
  return data.data
}

export async function getBus(id: number) {
  const { data } = await api.get<ApiResponse<Bus>>(`/buses/${id}`)
  return data.data
}

export async function createBus(payload: BusPayload, foto?: File | null) {
  const body = foto ? toFormData({ ...payload, foto }) : payload
  const { data } = await api.post<ApiResponse<Bus>>('/buses', body)
  return data.data
}

export async function updateBus(id: number, payload: BusPayload, foto?: File | null) {
  const body = foto ? toFormData({ ...payload, foto }) : payload
  const { data } = await api.put<ApiResponse<Bus>>(`/buses/${id}`, body)
  return data.data
}

export async function updateUbicacion(id: number, compartir_ubicacion: boolean) {
  const { data } = await api.patch<ApiResponse<Bus>>(`/buses/${id}/ubicacion`, {
    compartir_ubicacion,
  })
  return data.data
}
