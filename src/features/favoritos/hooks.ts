import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getFavoritos, marcarFavorito, quitarFavorito } from './api'

export function useFavoritos() {
  return useQuery({ queryKey: ['favoritos'], queryFn: getFavoritos })
}

/** Toggle favorito de un paradero puntual. */
export function useToggleFavorito() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ paraderoId, esFavorito }: { paraderoId: number; esFavorito: boolean }) => {
      if (esFavorito) await quitarFavorito(paraderoId)
      else await marcarFavorito(paraderoId)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favoritos'] }),
  })
}
