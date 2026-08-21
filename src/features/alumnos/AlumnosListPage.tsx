import { Link } from 'react-router-dom'
import { AlertCircle, Pencil, Plus } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EntityCard, EntityCardSkeleton } from '@/components/shared/EntityCard'
import { ListSearchInput } from '@/components/shared/ListSearchInput'
import { ListPagination } from '@/components/shared/ListPagination'
import { getErrorMessage } from '@/lib/axios'
import { useAuthStore } from '@/features/auth/auth-store'
import { PERMISOS } from '@/lib/permisos'
import { useListControls } from '@/hooks/useListControls'
import type { AlumnoAdmin } from '@/types/api'
import { useAlumnos } from './hooks'
import { EliminarAlumnoButton } from './EliminarAlumnoButton'

function matchesAlumno(alumno: AlumnoAdmin, query: string) {
  return [alumno.name, alumno.email, alumno.codigo].some((value) => value?.toLowerCase().includes(query))
}

export function AlumnosListPage() {
  const { data: alumnos, isPending, isError, error } = useAlumnos()
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const puedeEditar = hasPermission(PERMISOS.alumnosEditar)
  const puedeEliminar = hasPermission(PERMISOS.alumnosEliminar)
  const tieneAcciones = puedeEditar || puedeEliminar

  const { query, setQuery, page, setPage, pageCount, pageSize, total, paged } = useListControls(
    alumnos,
    matchesAlumno,
  )
  const sinDatos = !isPending && (alumnos?.length ?? 0) === 0
  const sinResultados = !isPending && !sinDatos && total === 0

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Alumnos</h1>
          <p className="text-sm text-muted-foreground">
            Alumnos con acceso al sistema — auto-registrados con Google o dados de alta manualmente.
          </p>
        </div>
        {hasPermission(PERMISOS.alumnosCrear) && (
          <Button asChild size="sm">
            <Link to="/admin/alumnos/nuevo">
              <Plus className="size-4" />
              Nuevo alumno
            </Link>
          </Button>
        )}
      </div>

      {isError && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {getErrorMessage(error)}
        </div>
      )}

      {!sinDatos && (
        <ListSearchInput value={query} onChange={setQuery} placeholder="Buscar por nombre, código, email..." />
      )}

      {/* Móvil: tarjetas */}
      <div className="space-y-3 md:hidden">
        {isPending && Array.from({ length: 4 }).map((_, i) => <EntityCardSkeleton key={i} />)}

        {sinDatos && (
          <p className="py-6 text-center text-sm text-muted-foreground">No hay alumnos registrados.</p>
        )}
        {sinResultados && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No se encontraron alumnos para "{query}".
          </p>
        )}

        {paged.map((alumno) => (
          <EntityCard
            key={alumno.id}
            title={alumno.name}
            subtitle={alumno.codigo ? `Código ${alumno.codigo}` : 'Sin código aún'}
            status={
              <Badge variant={alumno.activo ? 'default' : 'secondary'}>
                {alumno.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            }
            action={
              tieneAcciones && (
                <div className="flex items-center gap-1">
                  {puedeEditar && (
                    <Button asChild variant="ghost" size="icon-sm">
                      <Link to={`/admin/alumnos/${alumno.id}/editar`}>
                        <Pencil className="size-3.5" />
                      </Link>
                    </Button>
                  )}
                  {puedeEliminar && <EliminarAlumnoButton alumno={alumno} />}
                </div>
              )
            }
            fields={[{ label: 'Email', value: alumno.email }]}
          />
        ))}
      </div>

      {/* Escritorio: tabla */}
      <div className="hidden rounded-md border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 z-20 bg-background">Alumno</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Estado</TableHead>
              {tieneAcciones && <TableHead className="w-20" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: tieneAcciones ? 5 : 4 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {sinDatos && (
              <TableRow>
                <TableCell
                  colSpan={tieneAcciones ? 5 : 4}
                  className="text-center text-sm text-muted-foreground"
                >
                  No hay alumnos registrados.
                </TableCell>
              </TableRow>
            )}
            {sinResultados && (
              <TableRow>
                <TableCell
                  colSpan={tieneAcciones ? 5 : 4}
                  className="text-center text-sm text-muted-foreground"
                >
                  No se encontraron alumnos para "{query}".
                </TableCell>
              </TableRow>
            )}

            {paged.map((alumno) => (
              <TableRow key={alumno.id}>
                <TableCell className="sticky left-0 z-10 bg-background font-medium">
                  {alumno.name}
                </TableCell>
                <TableCell>
                  {alumno.codigo ?? <span className="text-muted-foreground">Sin código</span>}
                </TableCell>
                <TableCell>{alumno.email}</TableCell>
                <TableCell>
                  <Badge variant={alumno.activo ? 'default' : 'secondary'}>
                    {alumno.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                {tieneAcciones && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {puedeEditar && (
                        <Button asChild variant="ghost" size="icon-sm">
                          <Link to={`/admin/alumnos/${alumno.id}/editar`}>
                            <Pencil className="size-3.5" />
                          </Link>
                        </Button>
                      )}
                      {puedeEliminar && <EliminarAlumnoButton alumno={alumno} />}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ListPagination page={page} pageCount={pageCount} onPageChange={setPage} total={total} pageSize={pageSize} />
    </div>
  )
}
