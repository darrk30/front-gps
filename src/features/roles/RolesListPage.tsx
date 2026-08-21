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
import { PERMISOS, ROLES_PROTEGIDOS } from '@/lib/permisos'
import { useListControls } from '@/hooks/useListControls'
import type { Role } from '@/types/api'
import { useRoles } from './hooks'

const PREVIEW_MAX = 4

function matchesRole(role: Role, query: string) {
  return (
    role.name.toLowerCase().includes(query) ||
    role.permissions.some((permiso) => permiso.label.toLowerCase().includes(query))
  )
}

export function RolesListPage() {
  const { data: roles, isPending, isError, error } = useRoles()
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const puedeEditar = hasPermission(PERMISOS.rolesEditar)

  const { query, setQuery, page, setPage, pageCount, pageSize, total, paged } = useListControls(
    roles,
    matchesRole,
  )
  const sinDatos = !isPending && (roles?.length ?? 0) === 0
  const sinResultados = !isPending && !sinDatos && total === 0

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Roles</h1>
          <p className="text-sm text-muted-foreground">
            Roles del sistema y los permisos que otorgan.
          </p>
        </div>
        {hasPermission(PERMISOS.rolesCrear) && (
          <Button asChild size="sm">
            <Link to="/admin/roles/nuevo">
              <Plus className="size-4" />
              Nuevo rol
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
        <ListSearchInput value={query} onChange={setQuery} placeholder="Buscar por nombre, permiso..." />
      )}

      {/* Móvil: tarjetas */}
      <div className="space-y-3 md:hidden">
        {isPending && Array.from({ length: 3 }).map((_, i) => <EntityCardSkeleton key={i} />)}

        {sinDatos && (
          <p className="py-6 text-center text-sm text-muted-foreground">No hay roles registrados.</p>
        )}
        {sinResultados && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No se encontraron roles para "{query}".
          </p>
        )}

        {paged.map((role) => (
          <EntityCard
            key={role.id}
            title={role.name}
            status={
              ROLES_PROTEGIDOS.includes(role.name) && <Badge variant="outline">protegido</Badge>
            }
            action={
              puedeEditar && (
                <Button asChild variant="ghost" size="icon-sm">
                  <Link to={`/admin/roles/${role.id}/editar`}>
                    <Pencil className="size-3.5" />
                  </Link>
                </Button>
              )
            }
            extra={
              role.permissions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin permisos</p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, PREVIEW_MAX).map((permiso) => (
                    <Badge key={permiso.id} variant="secondary">
                      {permiso.label}
                    </Badge>
                  ))}
                  {role.permissions.length > PREVIEW_MAX && (
                    <Badge variant="secondary">+{role.permissions.length - PREVIEW_MAX} más</Badge>
                  )}
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
              <TableHead className="sticky left-0 z-20 bg-background">Nombre</TableHead>
              <TableHead>Permisos</TableHead>
              {puedeEditar && <TableHead className="w-10" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending &&
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                  {puedeEditar && (
                    <TableCell>
                      <Skeleton className="h-4 w-8" />
                    </TableCell>
                  )}
                </TableRow>
              ))}

            {sinDatos && (
              <TableRow>
                <TableCell
                  colSpan={puedeEditar ? 3 : 2}
                  className="text-center text-sm text-muted-foreground"
                >
                  No hay roles registrados.
                </TableCell>
              </TableRow>
            )}
            {sinResultados && (
              <TableRow>
                <TableCell
                  colSpan={puedeEditar ? 3 : 2}
                  className="text-center text-sm text-muted-foreground"
                >
                  No se encontraron roles para "{query}".
                </TableCell>
              </TableRow>
            )}

            {paged.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="sticky left-0 z-10 bg-background font-medium">
                  <div className="flex items-center gap-2">
                    {role.name}
                    {ROLES_PROTEGIDOS.includes(role.name) && (
                      <Badge variant="outline">protegido</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {role.permissions.length === 0 ? (
                    <span className="text-sm text-muted-foreground">Sin permisos</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, PREVIEW_MAX).map((permiso) => (
                        <Badge key={permiso.id} variant="secondary">
                          {permiso.label}
                        </Badge>
                      ))}
                      {role.permissions.length > PREVIEW_MAX && (
                        <Badge variant="secondary">
                          +{role.permissions.length - PREVIEW_MAX} más
                        </Badge>
                      )}
                    </div>
                  )}
                </TableCell>
                {puedeEditar && (
                  <TableCell>
                    <Button asChild variant="ghost" size="icon-sm">
                      <Link to={`/admin/roles/${role.id}/editar`}>
                        <Pencil className="size-3.5" />
                      </Link>
                    </Button>
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
