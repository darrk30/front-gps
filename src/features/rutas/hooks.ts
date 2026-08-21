import { useQuery } from '@tanstack/react-query'
import { getRuta, getRutas } from './api'

export function useRutas() {
  return useQuery({ queryKey: ['rutas'], queryFn: getRutas })
}

/** `id` puede ser `null`/`undefined` (ej. bus sin ruta asignada) — la query queda deshabilitada. */
export function useRuta(id: number | null | undefined) {
  return useQuery({
    queryKey: ['rutas', id],
    queryFn: () => getRuta(id as number),
    enabled: id != null && Number.isFinite(id),
  })
}
