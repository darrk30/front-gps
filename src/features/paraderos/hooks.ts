import { useQuery } from '@tanstack/react-query'
import { getParadero, getParaderos } from './api'

export function useParaderos() {
  return useQuery({ queryKey: ['paraderos'], queryFn: getParaderos })
}

export function useParadero(id: number) {
  return useQuery({
    queryKey: ['paraderos', id],
    queryFn: () => getParadero(id),
    enabled: Number.isFinite(id),
  })
}
