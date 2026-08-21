import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, MapPin, Menu, User as UserIcon } from 'lucide-react'
import { useAuthStore } from '@/features/auth/auth-store'
import { useLogout } from '@/features/auth/useLogout'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { navItems, type NavItem } from '@/app/nav-config'
import { AdminBreadcrumb } from '@/components/shared/AdminBreadcrumb'
import { UbicacionToggle } from '@/features/mapa/components/UbicacionToggle'
import { NotificationBell } from '@/features/notificaciones/NotificationBell'
import { PushNotificationsProvider } from '@/features/notificaciones/usePushNotifications'

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

function SidebarNavLinks({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-1 p-3">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
              isActive && 'bg-accent text-accent-foreground',
            )
          }
        >
          <item.icon className="size-4" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export function AppLayout() {
  const user = useAuthStore((s) => s.user)
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const cerrarSesion = useLogout()

  const visibleNavItems = navItems.filter((item) => !item.permiso || hasPermission(item.permiso))
  const esAlumno = user?.alumno != null

  return (
    // Envuelve toda la app autenticada: activa push para alumno y escucha
    // mensajes en primer plano una sola vez, sin importar qué página se
    // esté viendo (ver usePushNotifications.tsx).
    <PushNotificationsProvider>
      <div className="flex min-h-svh w-full">
        <aside className="hidden w-60 shrink-0 flex-col border-r bg-card md:flex">
          <div className="flex h-14 items-center gap-2 border-b px-4">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MapPin className="size-4" />
            </div>
            <span className="text-sm font-semibold">UNPRG Bus Tracker</span>
          </div>
          <SidebarNavLinks items={visibleNavItems} />
        </aside>

        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetContent side="left" className="w-60 p-0 sm:max-w-60">
            <SheetHeader className="border-b">
              <SheetTitle className="flex items-center gap-2 text-sm">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <MapPin className="size-4" />
                </div>
                UNPRG Bus Tracker
              </SheetTitle>
            </SheetHeader>
            <SidebarNavLinks items={visibleNavItems} onNavigate={() => setMobileNavOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex min-h-svh min-w-0 flex-1 flex-col">
          <header className="flex h-14 items-center justify-between border-b bg-card px-4">
            <div className="flex items-center gap-2 md:hidden">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Abrir menú"
              >
                <Menu className="size-4" />
              </Button>
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <MapPin className="size-4" />
              </div>
              <span className="text-sm font-semibold">UNPRG Bus Tracker</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              {location.pathname === '/mapa' && <UbicacionToggle />}
              {esAlumno && <NotificationBell />}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2">
                    <Avatar className="size-7">
                      <AvatarFallback className="text-xs">
                        {user ? initials(user.name) : <UserIcon className="size-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm font-medium sm:inline">{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/perfil')}>Mi perfil</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/cambiar-clave')}>
                    Cambiar contraseña
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={cerrarSesion}>
                    <LogOut className="size-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <AdminBreadcrumb />

          <main className="min-w-0 flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </PushNotificationsProvider>
  )
}
