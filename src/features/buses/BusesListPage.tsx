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
import type { Bus } from '@/types/api'
import { useBuses } from './hooks'

function matchesBus(bus: Bus, query: string) {
  const conductor = bus.conductor ? `${bus.conductor.nombres} ${bus.conductor.apellidos}` : ''
  return [bus.placa, bus.device_id, bus.modelo, bus.color, conductor].some((value) =>
    value?.toLowerCase().includes(query),
  )
}

export function BusesListPage() {
  const { data: buses, isPending, isError, error } = useBuses()
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const puedeEditar = hasPermission(PERMISOS.busesEditar)

  const { query, setQuery, page, setPage, pageCount, pageSize, total, paged } = useListControls(
    buses,
    matchesBus,
  )
  const sinDatos = !isPending && (buses?.length ?? 0) === 0
  const sinResultados = !isPending && !sinDatos && total === 0

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Buses</h1>
          <p className="text-sm text-muted-foreground">Flota de buses y su conductor asignado.</p>
        </div>
        {hasPermission(PERMISOS.busesCrear) && (
          <Button asChild size="sm">
            <Link to="/admin/buses/nuevo">
              <Plus className="size-4" />
              Nuevo bus
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
        <ListSearchInput value={query} onChange={setQuery} placeholder="Buscar por placa, conductor..." />
      )}

      {/* Móvil: tarjetas */}
      <div className="space-y-3 md:hidden">
        {isPending && Array.from({ length: 4 }).map((_, i) => <EntityCardSkeleton key={i} />)}

        {sinDatos && (
          <p className="py-6 text-center text-sm text-muted-foreground">No hay buses registrados.</p>
        )}
        {sinResultados && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No se encontraron buses para "{query}".
          </p>
        )}

        {paged.map((bus) => (
          <EntityCard
            key={bus.id}
            title={bus.placa}
            subtitle={bus.device_id ? `GPS ${bus.device_id}` : 'Sin GPS asignado'}
            image={bus.foto}
            status={
              <Badge variant={bus.activo ? 'default' : 'secondary'}>
                {bus.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            }
            action={
              puedeEditar && (
                <Button asChild variant="ghost" size="icon-sm">
                  <Link to={`/admin/buses/${bus.id}/editar`}>
                    <Pencil className="size-3.5" />
                  </Link>
                </Button>
              )
            }
            fields={[
              {
                label: 'Conductor',
                value: bus.conductor
                  ? `${bus.conductor.nombres} ${bus.conductor.apellidos}`
                  : 'Sin asignar',
              },
              { label: 'Ruta', value: bus.ruta?.nombre ?? 'Sin asignar' },
              { label: 'Capacidad', value: bus.capacidad },
              { label: 'Modelo', value: bus.modelo ?? '—' },
              { label: 'Año', value: bus.anio ?? '—' },
              { label: 'Color', value: bus.color ?? '—' },
            ]}
          />
        ))}
      </div>

      {/* Escritorio: tabla */}
      <div className="hidden rounded-md border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 z-20 bg-background">Bus</TableHead>
              <TableHead>Device ID</TableHead>
              <TableHead>Conductor</TableHead>
              <TableHead>Ruta</TableHead>
              <TableHead>Capacidad</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Año</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Estado</TableHead>
              {puedeEditar && <TableHead className="w-10" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: puedeEditar ? 10 : 9 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {sinDatos && (
              <TableRow>
                <TableCell
                  colSpan={puedeEditar ? 10 : 9}
                  className="text-center text-sm text-muted-foreground"
                >
                  No hay buses registrados.
                </TableCell>
              </TableRow>
            )}
            {sinResultados && (
              <TableRow>
                <TableCell
                  colSpan={puedeEditar ? 10 : 9}
                  className="text-center text-sm text-muted-foreground"
                >
                  No se encontraron buses para "{query}".
                </TableCell>
              </TableRow>
            )}

            {paged.map((bus) => (
              <TableRow key={bus.id}>
                <TableCell className="sticky left-0 z-10 bg-background">
                  <div className="flex items-center gap-2">
                    <Thumbnail src={bus.foto} />
                    <span className="max-w-32 truncate font-medium">{bus.placa}</span>
                  </div>
                </TableCell>
                <TableCell>{bus.device_id ?? '—'}</TableCell>
                <TableCell>
                  {bus.conductor ? `${bus.conductor.nombres} ${bus.conductor.apellidos}` : 'Sin asignar'}
                </TableCell>
                <TableCell>{bus.ruta?.nombre ?? 'Sin asignar'}</TableCell>
                <TableCell>{bus.capacidad}</TableCell>
                <TableCell>{bus.modelo}</TableCell>
                <TableCell>{bus.anio}</TableCell>
                <TableCell>{bus.color}</TableCell>
                <TableCell>
                  <Badge variant={bus.activo ? 'default' : 'secondary'}>
                    {bus.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                {puedeEditar && (
                  <TableCell>
                    <Button asChild variant="ghost" size="icon-sm">
                      <Link to={`/admin/buses/${bus.id}/editar`}>
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
