import { api } from '@/lib/axios'
import type { AlumnoAdmin, ApiResponse } from '@/types/api'

export interface AlumnoPayload {
  name: string
  email: string
  codigo: string
  activo: boolean
}

export async function getAlumnos() {
  const { data } = await api.get<ApiResponse<AlumnoAdmin[]>>('/alumnos')
  return data.data
}

export async function getAlumno(id: number) {
  const { data } = await api.get<ApiResponse<AlumnoAdmin>>(`/alumnos/${id}`)
  return data.data
}

export async function createAlumno(payload: AlumnoPayload) {
  const { data } = await api.post<ApiResponse<AlumnoAdmin>>('/alumnos', payload)
  return data.data
}

export async function updateAlumno(id: number, payload: AlumnoPayload) {
  const { data } = await api.put<ApiResponse<AlumnoAdmin>>(`/alumnos/${id}`, payload)
  return data.data
}

export async function deleteAlumno(id: number) {
  await api.delete<ApiResponse<null>>(`/alumnos/${id}`)
}

/** Vuelve la contraseña del alumno a su código actual (solo afecta login por contraseña, no por Google). */
export async function restablecerClaveAlumno(id: number) {
  await api.post<ApiResponse<null>>(`/alumnos/${id}/restablecer-clave`)
}
