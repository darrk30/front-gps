import { api } from '@/lib/axios'
import type { ApiResponse, Favorito } from '@/types/api'

export async function getFavoritos() {
  const { data } = await api.get<ApiResponse<Favorito[]>>('/favoritos')
  return data.data
}

export async function marcarFavorito(paraderoId: number) {
  const { data } = await api.post<ApiResponse<Favorito>>(`/paraderos/${paraderoId}/favorito`)
  return data.data
}

export async function quitarFavorito(paraderoId: number) {
  await api.delete<ApiResponse<null>>(`/paraderos/${paraderoId}/favorito`)
}
