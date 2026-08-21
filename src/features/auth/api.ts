import { api } from '@/lib/axios'
import type { ApiResponse, User } from '@/types/api'
import type {
  AuthResponse,
  ChangePasswordPayload,
  CompleteProfilePayload,
  GooglePayload,
  LoginPayload,
  RegisterPayload,
} from './types'

export async function login(payload: LoginPayload) {
  const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', payload)
  return data.data
}

export async function register(payload: RegisterPayload) {
  const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', payload)
  return data.data
}

export async function loginWithGoogle(payload: GooglePayload) {
  const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/google', payload)
  return data.data
}

export async function me() {
  const { data } = await api.get<ApiResponse<User>>('/auth/me')
  return data.data
}

export async function changePassword(payload: ChangePasswordPayload) {
  const { data } = await api.put<ApiResponse<User>>('/auth/password', payload)
  return data.data
}

export async function completeProfile(payload: CompleteProfilePayload) {
  const { data } = await api.put<ApiResponse<User>>('/auth/perfil', payload)
  return data.data
}

export async function logout() {
  await api.post<ApiResponse<null>>('/auth/logout')
}
