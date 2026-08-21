import { useQuery } from '@tanstack/react-query'
import { getPermisos, getRole, getRoles } from './api'

export function useRoles() {
  return useQuery({ queryKey: ['roles'], queryFn: getRoles })
}

export function useRole(id: number) {
  return useQuery({
    queryKey: ['roles', id],
    queryFn: () => getRole(id),
    enabled: Number.isFinite(id),
  })
}

export function usePermisos() {
  return useQuery({ queryKey: ['permisos'], queryFn: getPermisos })
}
