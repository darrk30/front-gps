import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
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

/** Endpoints públicos donde un 401 es una respuesta normal (credenciales/token inválido), no una sesión vencida. */
const SIN_REINTENTO_DE_REFRESH = ['/auth/login', '/auth/register', '/auth/google', '/auth/refresh']

let refrescando: Promise<string | null> | null = null

/**
 * Pide un token nuevo con el que ya está guardado (aunque haya vencido — el
 * backend lo acepta mientras siga dentro de JWT_REFRESH_TTL, ver
 * AuthController::refresh). Sin esto, cualquier pestaña que quede abierta
 * más de JWT_TTL fuerza un logout aunque el usuario siga activo. Usa axios
 * "pelado" (no `api`) para no pasar de nuevo por este mismo interceptor, y
 * memoiza la promesa para no disparar varios refresh en paralelo si caen
 * varias respuestas 401 juntas.
 */
function refrescarToken(): Promise<string | null> {
  const tokenActual = getAuthToken()
  if (!tokenActual) return Promise.resolve(null)

  refrescando ??= axios
    .post<ApiResponse<{ access_token: string }>>('/auth/refresh', null, {
      baseURL: import.meta.env.VITE_API_URL,
      headers: { Accept: 'application/json', Authorization: `Bearer ${tokenActual}` },
    })
    .then(({ data }) => {
      const nuevoToken = data.data.access_token
      useAuthStore.getState().setToken(nuevoToken)
      return nuevoToken
    })
    .catch(() => null)
    .finally(() => {
      refrescando = null
    })

  return refrescando
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const original = error.config as (InternalAxiosRequestConfig & { _reintentado?: boolean }) | undefined
    const esPublico = SIN_REINTENTO_DE_REFRESH.some((path) => original?.url?.includes(path))

    if (error.response?.status === 401 && original && !esPublico && !original._reintentado) {
      original._reintentado = true
      const nuevoToken = await refrescarToken()
      if (nuevoToken) {
        original.headers.Authorization = `Bearer ${nuevoToken}`
        return api(original)
      }
    }

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
