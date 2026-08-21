import { AlertCircle } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EntityCard, EntityCardSkeleton } from '@/components/shared/EntityCard'
import { ListSearchInput } from '@/components/shared/ListSearchInput'
import { ListPagination } from '@/components/shared/ListPagination'
import { getErrorMessage } from '@/lib/axios'
import { useAuthStore } from '@/features/auth/auth-store'
import { PERMISOS } from '@/lib/permisos'
import { useListControls } from '@/hooks/useListControls'
import type { User } from '@/types/api'
import { useUsuarios } from './hooks'
import { AsignarRolDialog } from './AsignarRolDialog'

function matchesUsuario(usuario: User, query: string) {
  return [usuario.name, usuario.email, ...usuario.roles].some((value) =>
    value?.toLowerCase().includes(query),
  )
}

export function UsuariosListPage() {
  const { data: usuarios, isPending, isError, error } = useUsuarios()
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const puedeEditar = hasPermission(PERMISOS.usuariosEditar)

  const { query, setQuery, page, setPage, pageCount, pageSize, total, paged } = useListControls(
    usuarios,
    matchesUsuario,
  )
  const sinDatos = !isPending && (usuarios?.length ?? 0) === 0
  const sinResultados = !isPending && !sinDatos && total === 0

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-lg font-semibold">Usuarios</h1>
        <p className="text-sm text-muted-foreground">Cuentas del sistema y su rol asignado.</p>
      </div>

      {isError && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {getErrorMessage(error)}
        </div>
      )}

      {!sinDatos && (
        <ListSearchInput value={query} onChange={setQuery} placeholder="Buscar por nombre, email, rol..." />
      )}

      {/* Móvil: tarjetas */}
      <div className="space-y-3 md:hidden">
        {isPending && Array.from({ length: 4 }).map((_, i) => <EntityCardSkeleton key={i} />)}

        {sinDatos && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No hay usuarios registrados.
          </p>
        )}
        {sinResultados && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No se encontraron usuarios para "{query}".
          </p>
        )}

        {paged.map((usuario) => (
          <EntityCard
            key={usuario.id}
            title={usuario.name}
            subtitle={usuario.email}
            status={usuario.password_temporal && <Badge variant="outline">temporal</Badge>}
            action={puedeEditar && <AsignarRolDialog usuario={usuario} />}
            extra={
              usuario.roles.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {usuario.roles.map((rol) => (
                    <Badge key={rol} variant="secondary">
                      {rol}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Sin rol</p>
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
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Contraseña</TableHead>
              {puedeEditar && <TableHead className="w-10" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: puedeEditar ? 5 : 4 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {sinDatos && (
              <TableRow>
                <TableCell
                  colSpan={puedeEditar ? 5 : 4}
                  className="text-center text-sm text-muted-foreground"
                >
                  No hay usuarios registrados.
                </TableCell>
              </TableRow>
            )}
            {sinResultados && (
              <TableRow>
                <TableCell
                  colSpan={puedeEditar ? 5 : 4}
                  className="text-center text-sm text-muted-foreground"
                >
                  No se encontraron usuarios para "{query}".
                </TableCell>
              </TableRow>
            )}

            {paged.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell className="sticky left-0 z-10 bg-background font-medium">
                  {usuario.name}
                </TableCell>
                <TableCell>{usuario.email}</TableCell>
                <TableCell>
                  {usuario.roles.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {usuario.roles.map((rol) => (
                        <Badge key={rol} variant="secondary">
                          {rol}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Sin rol</span>
                  )}
                </TableCell>
                <TableCell>
                  {usuario.password_temporal ? (
                    <Badge variant="outline">temporal</Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                {puedeEditar && (
                  <TableCell>
                    <AsignarRolDialog usuario={usuario} />
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
