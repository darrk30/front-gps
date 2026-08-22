import { formatFechaHora } from '@/lib/fecha'
import { cn } from '@/lib/utils'
import type { Notificacion } from '@/types/api'
import { iconoParaTipo } from './tipoIcono'

export function NotificacionRow({ notificacion, onClick }: { notificacion: Notificacion; onClick: () => void }) {
  const Icono = iconoParaTipo(notificacion.tipo)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-accent',
        !notificacion.leida && 'bg-blue-500/5',
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
        <Icono className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-medium">{notificacion.titulo}</p>
          {!notificacion.leida && <span className="size-1.5 shrink-0 rounded-full bg-blue-500" />}
        </div>
        <p className="text-xs text-muted-foreground">{notificacion.mensaje}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{formatFechaHora(notificacion.created_at)}</p>
      </div>
    </button>
  )
}
