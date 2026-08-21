import axios, { AxiosError } from 'axios'
import { getAuthToken, useAuthStore } from '@/features/auth/auth-store'
import type { ApiResponse, ValidationErrors } from '@/types/api'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    }
    return Promise.reject(error)
  },
)

/** Mensaje legible desde cualquier error de axios contra esta API. */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data?.message ?? 'Ocurrió un error de conexión con el servidor.'
  }
  return 'Ocurrió un error inesperado.'
}

/** Errores de validación por campo (422). Vacío si el error no es de validación. */
export function getValidationErrors(error: unknown): ValidationErrors {
  if (axios.isAxiosError<ApiResponse<ValidationErrors>>(error) && error.response?.status === 422) {
    return error.response.data?.data ?? {}
  }
  return {}
}
