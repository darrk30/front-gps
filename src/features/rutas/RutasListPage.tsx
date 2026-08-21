import { Link } from 'react-router-dom'
import { AlertCircle, ListOrdered, Pencil, Plus } from 'lucide-react'
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
import type { Ruta } from '@/types/api'
import { useRutas } from './hooks'
import { EliminarRutaButton } from './EliminarRutaButton'

function matchesRuta(ruta: Ruta, query: string) {
  return ruta.nombre.toLowerCase().includes(query)
}

export function RutasListPage() {
  const { data: rutas, isPending, isError, error } = useRutas()
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const puedeEditar = hasPermission(PERMISOS.rutasEditar)
  const puedeEliminar = hasPermission(PERMISOS.rutasEliminar)
  const tieneAcciones = puedeEditar || puedeEliminar

  const { query, setQuery, page, setPage, pageCount, pageSize, total, paged } = useListControls(
    rutas,
    matchesRuta,
  )
  const sinDatos = !isPending && (rutas?.length ?? 0) === 0
  const sinResultados = !isPending && !sinDatos && total === 0

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Rutas</h1>
          <p className="text-sm text-muted-foreground">
            Rutas de la flota y la secuencia de paraderos que sigue cada una.
          </p>
        </div>
        {hasPermission(PERMISOS.rutasCrear) && (
          <Button asChild size="sm">
            <Link to="/admin/rutas/nuevo">
              <Plus className="size-4" />
              Nueva ruta
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
        <ListSearchInput value={query} onChange={setQuery} placeholder="Buscar por nombre..." />
      )}

      {/* Móvil: tarjetas */}
      <div className="space-y-3 md:hidden">
        {isPending && Array.from({ length: 4 }).map((_, i) => <EntityCardSkeleton key={i} />)}

        {sinDatos && (
          <p className="py-6 text-center text-sm text-muted-foreground">No hay rutas registradas.</p>
        )}
        {sinResultados && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No se encontraron rutas para "{query}".
          </p>
        )}

        {paged.map((ruta) => (
          <EntityCard
            key={ruta.id}
            title={ruta.nombre}
            status={
              <Badge variant={ruta.activo ? 'default' : 'secondary'}>
                {ruta.activo ? 'Activa' : 'Inactiva'}
              </Badge>
            }
            action={
              tieneAcciones && (
                <div className="flex items-center gap-1">
                  <Button asChild variant="ghost" size="icon-sm">
                    <Link to={`/admin/rutas/${ruta.id}/puntos`} aria-label="Gestionar puntos">
                      <ListOrdered className="size-3.5" />
                    </Link>
                  </Button>
                  {puedeEditar && (
                    <Button asChild variant="ghost" size="icon-sm">
                      <Link to={`/admin/rutas/${ruta.id}/editar`}>
                        <Pencil className="size-3.5" />
                      </Link>
                    </Button>
                  )}
                  {puedeEliminar && <EliminarRutaButton ruta={ruta} />}
                </div>
              )
            }
          />
        ))}
      </div>

      {/* Escritorio: tabla */}
      <div className="hidden rounded-md border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 z-20 bg-background">Ruta</TableHead>
              <TableHead>Estado</TableHead>
              {tieneAcciones && <TableHead className="w-28" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: tieneAcciones ? 3 : 2 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {sinDatos && (
              <TableRow>
                <TableCell
                  colSpan={tieneAcciones ? 3 : 2}
                  className="text-center text-sm text-muted-foreground"
                >
                  No hay rutas registradas.
                </TableCell>
              </TableRow>
            )}
            {sinResultados && (
              <TableRow>
                <TableCell
                  colSpan={tieneAcciones ? 3 : 2}
                  className="text-center text-sm text-muted-foreground"
                >
                  No se encontraron rutas para "{query}".
                </TableCell>
              </TableRow>
            )}

            {paged.map((ruta) => (
              <TableRow key={ruta.id}>
                <TableCell className="sticky left-0 z-10 bg-background font-medium">
                  {ruta.nombre}
                </TableCell>
                <TableCell>
                  <Badge variant={ruta.activo ? 'default' : 'secondary'}>
                    {ruta.activo ? 'Activa' : 'Inactiva'}
                  </Badge>
                </TableCell>
                {tieneAcciones && (
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button asChild variant="ghost" size="icon-sm">
                        <Link to={`/admin/rutas/${ruta.id}/puntos`} aria-label="Gestionar puntos">
                          <ListOrdered className="size-3.5" />
                        </Link>
                      </Button>
                      {puedeEditar && (
                        <Button asChild variant="ghost" size="icon-sm">
                          <Link to={`/admin/rutas/${ruta.id}/editar`}>
                            <Pencil className="size-3.5" />
                          </Link>
                        </Button>
                      )}
                      {puedeEliminar && <EliminarRutaButton ruta={ruta} />}
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
