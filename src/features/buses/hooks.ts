import { useQuery } from '@tanstack/react-query'
import { getBus, getBuses } from './api'

export function useBuses() {
  return useQuery({ queryKey: ['buses'], queryFn: getBuses })
}

export function useBus(id: number) {
  return useQuery({
    queryKey: ['buses', id],
    queryFn: () => getBus(id),
    enabled: Number.isFinite(id),
  })
}
