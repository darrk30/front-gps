import { Bus, GraduationCap, IdCard, MapPin, Milestone, Route, ShieldCheck, User, Users } from 'lucide-react'
import type { ComponentType } from 'react'
import { PERMISOS } from '@/lib/permisos'

export interface NavItem {
  label: string
  to: string
  icon: ComponentType<{ className?: string }>
  /** Permiso requerido para ver el item. Sin permiso => visible para cualquier autenticado. */
  permiso?: string
}

/**
 * Fuente única de verdad para el sidebar de AppLayout y las rutas /admin/*
 * (ver router.tsx, que usa el mismo `permiso` de cada item para envolverlo
 * en <ProtectedRoute>). No dupliques esta lista ni la lógica de permisos.
 *
 * "alumno" ya no comparte permiso con estos ítems de administración: tiene
 * `buses.consultar`/`paraderos.consultar`/`rutas.consultar` (para el mapa),
 * no `buses.ver`/`paraderos.ver`/`rutas.ver` (para gestionarlos) — así que
 * estos ítems se ocultan solos para alumno sin necesitar un caso especial.
 */
export const navItems: NavItem[] = [
  { label: 'Mapa', to: '/mapa', icon: MapPin },
  // Vista de solo consulta (alumno): mismo ícono/nombre que la de admin,
  // pero apunta a /rutas (no /admin/rutas) y usa rutas.consultar — ningún
  // rol tiene ambos permisos a la vez, así que nunca se duplican en el menú.
  { label: 'Rutas', to: '/rutas', icon: Route, permiso: PERMISOS.rutasConsultar },
  { label: 'Conductores', to: '/admin/conductores', icon: IdCard, permiso: PERMISOS.conductoresVer },
  { label: 'Alumnos', to: '/admin/alumnos', icon: GraduationCap, permiso: PERMISOS.alumnosVer },
  { label: 'Buses', to: '/admin/buses', icon: Bus, permiso: PERMISOS.busesVer },
  { label: 'Paraderos', to: '/admin/paraderos', icon: Milestone, permiso: PERMISOS.paraderosVer },
  { label: 'Rutas', to: '/admin/rutas', icon: Route, permiso: PERMISOS.rutasVer },
  { label: 'Roles', to: '/admin/roles', icon: ShieldCheck, permiso: PERMISOS.rolesVer },
  { label: 'Usuarios', to: '/admin/usuarios', icon: Users, permiso: PERMISOS.usuariosVer },
  { label: 'Perfil', to: '/perfil', icon: User },
]
