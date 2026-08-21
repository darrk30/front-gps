import { useQuery } from '@tanstack/react-query'
import { getConductor, getConductores } from './api'

export function useConductores() {
  return useQuery({ queryKey: ['conductores'], queryFn: getConductores })
}

export function useConductor(id: number) {
  return useQuery({
    queryKey: ['conductores', id],
    queryFn: () => getConductor(id),
    enabled: Number.isFinite(id),
  })
}
