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
import { Thumbnail } from '@/components/shared/Thumbnail'
import { ListSearchInput } from '@/components/shared/ListSearchInput'
import { ListPagination } from '@/components/shared/ListPagination'
import { getErrorMessage } from '@/lib/axios'
import { useAuthStore } from '@/features/auth/auth-store'
import { PERMISOS } from '@/lib/permisos'
import { useListControls } from '@/hooks/useListControls'
import type { Conductor } from '@/types/api'
import { useConductores } from './hooks'

function matchesConductor(conductor: Conductor, query: string) {
  return [
    conductor.nombres,
    conductor.apellidos,
    conductor.dni,
    conductor.email,
    conductor.licencia_numero,
  ].some((value) => value?.toLowerCase().includes(query))
}

export function ConductoresListPage() {
  const { data: conductores, isPending, isError, error } = useConductores()
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const puedeEditar = hasPermission(PERMISOS.conductoresEditar)

  const { query, setQuery, page, setPage, pageCount, pageSize, total, paged } = useListControls(
    conductores,
    matchesConductor,
  )
  const sinDatos = !isPending && (conductores?.length ?? 0) === 0
  const sinResultados = !isPending && !sinDatos && total === 0

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Conductores</h1>
          <p className="text-sm text-muted-foreground">
            Conductores registrados y su información de licencia.
          </p>
        </div>
        {hasPermission(PERMISOS.conductoresCrear) && (
          <Button asChild size="sm">
            <Link to="/admin/conductores/nuevo">
              <Plus className="size-4" />
              Nuevo conductor
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
        <ListSearchInput value={query} onChange={setQuery} placeholder="Buscar por nombre, DNI, email..." />
      )}

      {/* Móvil: tarjetas */}
      <div className="space-y-3 md:hidden">
        {isPending && Array.from({ length: 4 }).map((_, i) => <EntityCardSkeleton key={i} />)}

        {sinDatos && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No hay conductores registrados.
          </p>
        )}
        {sinResultados && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No se encontraron conductores para "{query}".
          </p>
        )}

        {paged.map((conductor) => (
          <EntityCard
            key={conductor.id}
            title={`${conductor.nombres} ${conductor.apellidos}`}
            subtitle={`DNI ${conductor.dni}`}
            image={conductor.foto}
            status={
              <Badge variant={conductor.activo ? 'default' : 'secondary'}>
                {conductor.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            }
            action={
              puedeEditar && (
                <Button asChild variant="ghost" size="icon-sm">
                  <Link to={`/admin/conductores/${conductor.id}/editar`}>
                    <Pencil className="size-3.5" />
                  </Link>
                </Button>
              )
            }
            fields={[
              { label: 'Teléfono', value: conductor.telefono ?? '—' },
              { label: 'Email', value: conductor.email },
              {
                label: 'Licencia',
                value: `${conductor.licencia_numero} (${conductor.licencia_categoria})`,
              },
              { label: 'Vencimiento', value: conductor.licencia_vencimiento },
            ]}
          />
        ))}
      </div>

      {/* Escritorio: tabla */}
      <div className="hidden rounded-md border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 z-20 bg-background">Conductor</TableHead>
              <TableHead>DNI</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Licencia</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead>Estado</TableHead>
              {puedeEditar && <TableHead className="w-10" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: puedeEditar ? 8 : 7 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {sinDatos && (
              <TableRow>
                <TableCell
                  colSpan={puedeEditar ? 8 : 7}
                  className="text-center text-sm text-muted-foreground"
                >
                  No hay conductores registrados.
                </TableCell>
              </TableRow>
            )}
            {sinResultados && (
              <TableRow>
                <TableCell
                  colSpan={puedeEditar ? 8 : 7}
                  className="text-center text-sm text-muted-foreground"
                >
                  No se encontraron conductores para "{query}".
                </TableCell>
              </TableRow>
            )}

            {paged.map((conductor) => (
              <TableRow key={conductor.id}>
                <TableCell className="sticky left-0 z-10 bg-background">
                  <div className="flex items-center gap-2">
                    <Thumbnail src={conductor.foto} />
                    <span className="max-w-36 truncate font-medium">
                      {conductor.nombres} {conductor.apellidos}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{conductor.dni}</TableCell>
                <TableCell>{conductor.telefono ?? '—'}</TableCell>
                <TableCell>{conductor.email}</TableCell>
                <TableCell>
                  {conductor.licencia_numero} ({conductor.licencia_categoria})
                </TableCell>
                <TableCell>{conductor.licencia_vencimiento}</TableCell>
                <TableCell>
                  <Badge variant={conductor.activo ? 'default' : 'secondary'}>
                    {conductor.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                {puedeEditar && (
                  <TableCell>
                    <Button asChild variant="ghost" size="icon-sm">
                      <Link to={`/admin/conductores/${conductor.id}/editar`}>
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
