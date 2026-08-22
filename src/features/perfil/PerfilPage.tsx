import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from 'next-themes'
import { Bell, ChevronRight, CircleHelp, Info, LogOut, Moon, UserPen } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { useAuthStore } from '@/features/auth/auth-store'
import { useLogout } from '@/features/auth/useLogout'
import { usePushNotifications } from '@/features/notificaciones/usePushNotifications'

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrador',
  conductor: 'Conductor',
  alumno: 'Estudiante',
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function PerfilRow({
  icon,
  label,
  hint,
  to,
  onClick,
  right,
  destructive,
}: {
  icon: ReactNode
  label: string
  /** Texto chico debajo del label, ej. para explicar por qué una acción está deshabilitada. */
  hint?: ReactNode
  to?: string
  onClick?: () => void
  right?: ReactNode
  destructive?: boolean
}) {
  const content = (
    <div
      className={`flex items-center gap-3 px-4 py-3.5 ${destructive ? 'text-destructive' : ''} ${to || onClick ? 'hover:bg-accent' : ''}`}
    >
      {icon}
      <span className="flex-1">
        <span className="block font-medium">{label}</span>
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </span>
      {right ?? (to && <ChevronRight className="size-4 text-muted-foreground" />)}
    </div>
  )

  if (to) return <Link to={to}>{content}</Link>
  if (onClick) return <button type="button" onClick={onClick} className="w-full text-left">{content}</button>
  return content
}

export function PerfilPage() {
  const user = useAuthStore((s) => s.user)
  const { resolvedTheme, setTheme } = useTheme()
  const cerrarSesion = useLogout()
  const { activo: pushActivo, activar: activarPush } = usePushNotifications()
  const permisoDenegado = typeof Notification !== 'undefined' && Notification.permission === 'denied'

  const rol = user?.roles[0]
  const esAlumno = user?.alumno != null

  return (
    <div>
      <div className="bg-primary px-6 pb-8 pt-10 text-center text-primary-foreground">
        <Avatar size="lg" className="mx-auto mb-3 size-16">
          <AvatarFallback className="bg-primary-foreground/15 text-lg font-medium text-primary-foreground">
            {user ? initials(user.name) : ''}
          </AvatarFallback>
        </Avatar>
        <p className="text-lg font-semibold">{user?.name}</p>
        {rol && <p className="text-sm text-primary-foreground/70">{ROLE_LABEL[rol] ?? rol}</p>}
        <p className="text-xs text-primary-foreground/60">{user?.email}</p>
      </div>

      <div className="mx-auto -mt-4 max-w-xl space-y-3 p-4">
        <div className="divide-y rounded-lg border bg-card">
          <PerfilRow icon={<UserPen className="size-4 text-muted-foreground" />} label="Editar perfil" to="/perfil/editar" />
          <PerfilRow
            icon={<Moon className="size-4 text-muted-foreground" />}
            label="Modo oscuro"
            right={
              <Switch
                checked={resolvedTheme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            }
          />
          {esAlumno && (
            <PerfilRow
              icon={<Bell className="size-4 text-muted-foreground" />}
              label="Notificaciones"
              hint={
                permisoDenegado &&
                'Bloqueadas en el navegador. Tócalo (🔒 o ⓘ) junto a la dirección del sitio y permite las notificaciones.'
              }
              right={
                <Switch
                  checked={pushActivo}
                  disabled={pushActivo || permisoDenegado}
                  onCheckedChange={(checked) => checked && activarPush()}
                />
              }
            />
          )}
          <PerfilRow icon={<CircleHelp className="size-4 text-muted-foreground" />} label="Ayuda y soporte" to="/perfil/ayuda" />
          <PerfilRow icon={<Info className="size-4 text-muted-foreground" />} label="Acerca de la app" to="/perfil/acerca-de" />
        </div>

        <div className="rounded-lg border bg-card">
          <PerfilRow
            icon={<LogOut className="size-4" />}
            label="Cerrar sesión"
            onClick={cerrarSesion}
            destructive
          />
        </div>
      </div>
    </div>
  )
}
