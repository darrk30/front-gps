import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Notificacion } from '@/types/api'
import { useMarcarLeida, useMarcarTodasLeidas, useNotificaciones } from './hooks'
import { NotificacionRow } from './NotificacionRow'
import { useCargaIncremental } from './useCargaIncremental'

export function NotificacionesPage() {
  const navigate = useNavigate()
  const { data: notificaciones, isLoading } = useNotificaciones()
  const marcarLeida = useMarcarLeida()
  const marcarTodas = useMarcarTodasLeidas()

  const lista = notificaciones ?? []
  const noLeidas = lista.filter((n) => !n.leida).length
  const { visibles, hayMas, sentinelRef } = useCargaIncremental(lista)

  function handleClick(notificacion: Notificacion) {
    if (!notificacion.leida) marcarLeida.mutate(notificacion.id)
    if (notificacion.data.paradero_id) navigate(`/paraderos/${notificacion.data.paradero_id}`)
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="flex items-center gap-2 border-b bg-card px-3 py-2.5">
        <Button variant="ghost" size="icon-sm" onClick={() => navigate(-1)} aria-label="Volver">
          <ArrowLeft className="size-4" />
        </Button>
        <span className="flex-1 text-sm font-medium">Notificaciones</span>
        {noLeidas > 0 && (
          <button
            type="button"
            className="text-xs text-blue-600 hover:underline dark:text-blue-400"
            onClick={() => marcarTodas.mutate()}
          >
            Marcar todas como leídas
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="p-4 text-center text-sm text-muted-foreground">Cargando...</p>
      ) : lista.length === 0 ? (
        <p className="p-4 text-center text-sm text-muted-foreground">No tenés notificaciones.</p>
      ) : (
        <div className="divide-y">
          {visibles.map((notificacion) => (
            <NotificacionRow
              key={notificacion.id}
              notificacion={notificacion}
              onClick={() => handleClick(notificacion)}
            />
          ))}
          {hayMas && (
            <div ref={sentinelRef} className="p-3 text-center text-xs text-muted-foreground">
              Cargando más...
            </div>
          )}
        </div>
      )}
    </div>
  )
}
