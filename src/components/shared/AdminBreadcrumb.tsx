import { Link, useLocation } from 'react-router-dom'
import { Home } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { navItems } from '@/app/nav-config'

/**
 * Miga de pan de la ubicación actual dentro de /admin/*. Se monta una sola
 * vez en AppLayout para no duplicar esta lógica en cada feature. La
 * navegación entre módulos ya vive en el sidebar/menú móvil — esta barra
 * solo indica dónde estás, no repite esos enlaces.
 */
export function AdminBreadcrumb() {
  const location = useLocation()

  const segments = location.pathname.split('/').filter(Boolean)
  if (segments[0] !== 'admin') return null

  const section = navItems.find((item) => item.to === `/admin/${segments[1]}`)
  const action = segments[2] === 'nuevo' ? 'Nuevo' : segments[3] === 'editar' ? 'Editar' : null

  return (
    <div className="border-b bg-card px-6 py-3">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/mapa" className="flex items-center">
                <Home className="size-3.5" />
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {action ? (
              <BreadcrumbLink asChild>
                <Link to={section?.to ?? '/mapa'}>{section?.label}</Link>
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage>{section?.label}</BreadcrumbPage>
            )}
          </BreadcrumbItem>
          {action && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{action}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}
