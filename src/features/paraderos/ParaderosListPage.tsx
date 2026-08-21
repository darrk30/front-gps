import { useMemo, useState } from 'react'
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EntityCard, EntityCardSkeleton } from '@/components/shared/EntityCard'
import { Thumbnail } from '@/components/shared/Thumbnail'
import { ListSearchInput } from '@/components/shared/ListSearchInput'
import { ListPagination } from '@/components/shared/ListPagination'
import { getErrorMessage } from '@/lib/axios'
import { useAuthStore } from '@/features/auth/auth-store'
import { PERMISOS } from '@/lib/permisos'
import { useListControls } from '@/hooks/useListControls'
import type { Paradero, TipoPuntoRuta } from '@/types/api'
import { useParaderos } from './hooks'

type FiltroTipo = TipoPuntoRuta | 'todos'

function matchesParadero(paradero: Paradero, query: string) {
  return [paradero.nombre, paradero.referencia, paradero.tipo].some((value) =>
    value?.toLowerCase().includes(query),
  )
}

function TipoBadge({ tipo }: { tipo: TipoPuntoRuta }) {
  return tipo === 'paradero' ? (
    <Badge className="bg-blue-500 text-white hover:bg-blue-500/90">Paradero</Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground">
      Parada
    </Badge>
  )
}

export function ParaderosListPage() {
  const { data: paraderos, isPending, isError, error } = useParaderos()
  const [tipo, setTipo] = useState<FiltroTipo>('todos')
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const puedeEditar = hasPermission(PERMISOS.paraderosEditar)

  const porTipo = useMemo(
    () => (tipo === 'todos' ? paraderos : paraderos?.filter((p) => p.tipo === tipo)),
    [paraderos, tipo],
  )

  const { query, setQuery, page, setPage, pageCount, pageSize, total, paged } = useListControls(
    porTipo,
    matchesParadero,
  )
  const sinDatos = !isPending && (porTipo?.length ?? 0) === 0
  const sinResultados = !isPending && !sinDatos && total === 0

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Paraderos</h1>
          <p className="text-sm text-muted-foreground">Puntos de parada fijos de la ruta.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Tabs value={tipo} onValueChange={(v) => setTipo(v as FiltroTipo)}>
            <TabsList>
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="paradero">Paraderos</TabsTrigger>
              <TabsTrigger value="parada">Paradas</TabsTrigger>
            </TabsList>
          </Tabs>
          {hasPermission(PERMISOS.paraderosCrear) && (
            <Button asChild size="sm">
              <Link to="/admin/paraderos/nuevo">
                <Plus className="size-4" />
                Nuevo paradero
              </Link>
            </Button>
          )}
        </div>
      </div>

      {isError && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {getErrorMessage(error)}
        </div>
      )}

      {!sinDatos && (
        <ListSearchInput value={query} onChange={setQuery} placeholder="Buscar por nombre, referencia..." />
      )}

      {/* Móvil: tarjetas */}
      <div className="space-y-3 md:hidden">
        {isPending && Array.from({ length: 4 }).map((_, i) => <EntityCardSkeleton key={i} />)}

        {sinDatos && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No hay paraderos de este tipo.
          </p>
        )}
        {sinResultados && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No se encontraron paraderos para "{query}".
          </p>
        )}

        {paged.map((paradero) => (
          <EntityCard
            key={paradero.id}
            title={paradero.nombre}
            subtitle={<TipoBadge tipo={paradero.tipo} />}
            image={paradero.foto}
            status={
              <Badge variant={paradero.activo ? 'default' : 'secondary'}>
                {paradero.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            }
            action={
              puedeEditar && (
                <Button asChild variant="ghost" size="icon-sm">
                  <Link to={`/admin/paraderos/${paradero.id}/editar`}>
                    <Pencil className="size-3.5" />
                  </Link>
                </Button>
              )
            }
            fields={[
              {
                label: 'Coordenadas',
                value: `${paradero.latitude.toFixed(5)}, ${paradero.longitude.toFixed(5)}`,
              },
              { label: 'Referencia', value: paradero.referencia ?? '—' },
            ]}
          />
        ))}
      </div>

      {/* Escritorio: tabla */}
      <div className="hidden rounded-md border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 z-20 bg-background">Paradero</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Coordenadas</TableHead>
              <TableHead>Referencia</TableHead>
              <TableHead>Estado</TableHead>
              {puedeEditar && <TableHead className="w-10" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: puedeEditar ? 6 : 5 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {sinDatos && (
              <TableRow>
                <TableCell
                  colSpan={puedeEditar ? 6 : 5}
                  className="text-center text-sm text-muted-foreground"
                >
                  No hay paraderos de este tipo.
                </TableCell>
              </TableRow>
            )}
            {sinResultados && (
              <TableRow>
                <TableCell
                  colSpan={puedeEditar ? 6 : 5}
                  className="text-center text-sm text-muted-foreground"
                >
                  No se encontraron paraderos para "{query}".
                </TableCell>
              </TableRow>
            )}

            {paged.map((paradero) => (
              <TableRow key={paradero.id}>
                <TableCell className="sticky left-0 z-10 bg-background">
                  <div className="flex items-center gap-2">
                    <Thumbnail src={paradero.foto} />
                    <span className="max-w-36 truncate font-medium">{paradero.nombre}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <TipoBadge tipo={paradero.tipo} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {paradero.latitude.toFixed(5)}, {paradero.longitude.toFixed(5)}
                </TableCell>
                <TableCell>{paradero.referencia ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant={paradero.activo ? 'default' : 'secondary'}>
                    {paradero.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                {puedeEditar && (
                  <TableCell>
                    <Button asChild variant="ghost" size="icon-sm">
                      <Link to={`/admin/paraderos/${paradero.id}/editar`}>
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
