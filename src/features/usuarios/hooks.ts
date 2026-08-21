import { useQuery } from '@tanstack/react-query'
import { getUsuarios } from './api'

export function useUsuarios() {
  return useQuery({ queryKey: ['usuarios'], queryFn: getUsuarios })
}
