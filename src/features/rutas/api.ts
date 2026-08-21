import { api } from '@/lib/axios'
import type { ApiResponse, PuntoRuta, Ruta, RutaDetalle } from '@/types/api'

export interface RutaPayload {
  nombre: string
  activo: boolean
}

export interface RutaPuntoPayload {
  paradero_id: number
  orden: number
}

export async function getRutas() {
  const { data } = await api.get<ApiResponse<Ruta[]>>('/rutas')
  return data.data
}

export async function getRuta(id: number) {
  const { data } = await api.get<ApiResponse<RutaDetalle>>(`/rutas/${id}`)
  return data.data
}

export async function createRuta(payload: RutaPayload) {
  const { data } = await api.post<ApiResponse<Ruta>>('/rutas', payload)
  return data.data
}

export async function updateRuta(id: number, payload: RutaPayload) {
  const { data } = await api.put<ApiResponse<Ruta>>(`/rutas/${id}`, payload)
  return data.data
}

export async function deleteRuta(id: number) {
  await api.delete<ApiResponse<null>>(`/rutas/${id}`)
}

export async function addPuntoRuta(rutaId: number, payload: RutaPuntoPayload) {
  const { data } = await api.post<ApiResponse<PuntoRuta>>(`/rutas/${rutaId}/paraderos`, payload)
  return data.data
}

export async function updatePuntoRuta(rutaId: number, id: number, payload: RutaPuntoPayload) {
  const { data } = await api.put<ApiResponse<PuntoRuta>>(`/rutas/${rutaId}/paraderos/${id}`, payload)
  return data.data
}

export async function removePuntoRuta(rutaId: number, id: number) {
  await api.delete<ApiResponse<null>>(`/rutas/${rutaId}/paraderos/${id}`)
}
