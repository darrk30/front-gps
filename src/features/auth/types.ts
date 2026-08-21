import type { User } from '@/types/api'

/** Forma de "data" en login/register/google. */
export interface AuthResponse {
  user: User
  access_token: string
  token_type: string
  expires_in: number
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface GooglePayload {
  token: string
}

export interface ChangePasswordPayload {
  current_password: string
  password: string
  password_confirmation: string
}

export interface CompleteProfilePayload {
  codigo: string
}
