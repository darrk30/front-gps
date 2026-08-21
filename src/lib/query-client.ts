import { QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getErrorMessage } from './axios'

/**
 * Toast global para cualquier useQuery que falle (los hooks de lectura no
 * manejan errores uno por uno). Las mutaciones ya muestran su propio toast
 * en cada form, así que esto no las toca (evita duplicar el aviso).
 * `meta: { silent: true }` la salta — para queries "mejor esfuerzo" que ya
 * degradan solas ante un error (ej. useRoadRoute, que cae a líneas rectas si
 * el servicio de ruteo falla) y no ameritan interrumpir al usuario.
 */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.silent) return
      toast.error(getErrorMessage(error))
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})
