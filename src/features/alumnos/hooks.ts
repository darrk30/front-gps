import { useQuery } from '@tanstack/react-query'
import { getAlumno, getAlumnos } from './api'

export function useAlumnos() {
  return useQuery({ queryKey: ['alumnos'], queryFn: getAlumnos })
}

export function useAlumno(id: number) {
  return useQuery({
    queryKey: ['alumnos', id],
    queryFn: () => getAlumno(id),
    enabled: Number.isFinite(id),
  })
}
