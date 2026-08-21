import { Bell } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Notificacion } from '@/types/api'
import { useMarcarLeida, useMarcarTodasLeidas, useNotificaciones } from './hooks'
import { NotificacionRow } from './NotificacionRow'

const MAX_EN_PANEL = 8

export function NotificationBell() {
  const navigate = useNavigate()
  const { data: notificaciones } = useNotificaciones()
  const marcarLeida = useMarcarLeida()
  const marcarTodas = useMarcarTodasLeidas()

  const lista = notificaciones ?? []
  const noLeidas = lista.filter((n) => !n.leida).length

  function handleClick(notificacion: Notificacion) {
    if (!notificacion.leida) marcarLeida.mutate(notificacion.id)
    if (notificacion.data.paradero_id) navigate(`/paraderos/${notificacion.data.paradero_id}`)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="relative" aria-label="Notificaciones">
          <Bell className="size-5" />
          {noLeidas > 0 && (
            <span className="absolute -top-1.5 -right-1 flex size-[18px] items-center justify-center rounded-full bg-destructive text-[11px] font-medium text-white">
              {noLeidas > 9 ? '9+' : noLeidas}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2.5">
          <span className="text-sm font-medium">Notificaciones</span>
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

        {lista.length === 0 ? (
          <p className="p-4 text-center text-sm text-muted-foreground">No tenés notificaciones.</p>
        ) : (
          <div className="max-h-[min(60vh,22rem)] divide-y overflow-y-auto">
            {lista.slice(0, MAX_EN_PANEL).map((notificacion) => (
              <NotificacionRow
                key={notificacion.id}
                notificacion={notificacion}
                onClick={() => handleClick(notificacion)}
              />
            ))}
          </div>
        )}

        <DropdownMenuItem asChild className="justify-center border-t text-sm text-blue-600 dark:text-blue-400">
          <Link to="/notificaciones">Ver todas las notificaciones</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
