import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { AppLayout } from '@/layouts/AppLayout'
import { GuestOnly } from '@/routes/GuestOnly'
import { RequireAuth } from '@/routes/RequireAuth'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { PERMISOS } from '@/lib/permisos'
import { LoginPage } from '@/features/auth/LoginPage'
import { GoogleCallbackPage } from '@/features/auth/GoogleCallbackPage'
import { ChangePasswordPage } from '@/features/auth/ChangePasswordPage'
import { CompleteProfilePage } from '@/features/auth/CompleteProfilePage'
import { MapaPage } from '@/features/mapa/MapaPage'
import { ConductoresListPage } from '@/features/conductores/ConductoresListPage'
import { ConductorFormPage } from '@/features/conductores/ConductorFormPage'
import { AlumnosListPage } from '@/features/alumnos/AlumnosListPage'
import { AlumnoFormPage } from '@/features/alumnos/AlumnoFormPage'
import { BusesListPage } from '@/features/buses/BusesListPage'
import { BusFormPage } from '@/features/buses/BusFormPage'
import { ParaderosListPage } from '@/features/paraderos/ParaderosListPage'
import { ParaderoFormPage } from '@/features/paraderos/ParaderoFormPage'
import { RolesListPage } from '@/features/roles/RolesListPage'
import { RoleFormPage } from '@/features/roles/RoleFormPage'
import { UsuariosListPage } from '@/features/usuarios/UsuariosListPage'
import { RutasListPage } from '@/features/rutas/RutasListPage'
import { RutaFormPage } from '@/features/rutas/RutaFormPage'
import { RutaPuntosPage } from '@/features/rutas/RutaPuntosPage'
import { RutasPublicasPage } from '@/features/rutas/RutasPublicasPage'
import { RutaDetallePublicaPage } from '@/features/rutas/RutaDetallePublicaPage'
import { ParaderoDetallePage } from '@/features/paraderos/ParaderoDetallePage'
import { PerfilPage } from '@/features/perfil/PerfilPage'
import { EditarPerfilPage } from '@/features/perfil/EditarPerfilPage'
import { AyudaSoportePage } from '@/features/perfil/AyudaSoportePage'
import { AcercaDePage } from '@/features/perfil/AcercaDePage'
import { NotificacionesPage } from '@/features/notificaciones/NotificacionesPage'

export const router = createBrowserRouter([
  {
    element: <GuestOnly />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/google/callback', element: <GoogleCallbackPage /> },
        ],
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/completar-perfil', element: <CompleteProfilePage /> },
          { path: '/cambiar-clave', element: <ChangePasswordPage /> },
          { path: '/mapa', element: <MapaPage /> },
          { path: '/perfil', element: <PerfilPage /> },
          { path: '/perfil/editar', element: <EditarPerfilPage /> },
          { path: '/perfil/ayuda', element: <AyudaSoportePage /> },
          { path: '/perfil/acerca-de', element: <AcercaDePage /> },
          { path: '/notificaciones', element: <NotificacionesPage /> },
          {
            element: <ProtectedRoute permiso={PERMISOS.rutasConsultar} />,
            children: [
              { path: '/rutas', element: <RutasPublicasPage /> },
              { path: '/rutas/:id', element: <RutaDetallePublicaPage /> },
            ],
          },
          {
            element: <ProtectedRoute permiso={PERMISOS.paraderosConsultar} />,
            children: [{ path: '/paraderos/:id', element: <ParaderoDetallePage /> }],
          },
          {
            element: <ProtectedRoute permiso={PERMISOS.conductoresVer} />,
            children: [{ path: '/admin/conductores', element: <ConductoresListPage /> }],
          },
          {
            element: <ProtectedRoute permiso={PERMISOS.conductoresCrear} />,
            children: [{ path: '/admin/conductores/nuevo', element: <ConductorFormPage /> }],
          },
          {
            element: <ProtectedRoute permiso={PERMISOS.conductoresEditar} />,
            children: [
              { path: '/admin/conductores/:id/editar', element: <ConductorFormPage /> },
            ],
          },
          {
            element: <ProtectedRoute permiso={PERMISOS.alumnosVer} />,
            children: [{ path: '/admin/alumnos', element: <AlumnosListPage /> }],
          },
          {
            element: <ProtectedRoute permiso={PERMISOS.alumnosCrear} />,
            children: [{ path: '/admin/alumnos/nuevo', element: <AlumnoFormPage /> }],
          },
          {
            element: <ProtectedRoute permiso={PERMISOS.alumnosEditar} />,
            children: [{ path: '/admin/alumnos/:id/editar', element: <AlumnoFormPage /> }],
          },
          {
            element: <ProtectedRoute permiso={PERMISOS.busesVer} />,
            children: [{ path: '/admin/buses', element: <BusesListPage /> }],
          },
          {
            element: <ProtectedRoute permiso={PERMISOS.busesCrear} />,
            children: [{ path: '/admin/buses/nuevo', element: <BusFormPage /> }],
          },
          {
            element: <ProtectedRoute permiso={PERMISOS.busesEditar} />,
            children: [{ path: '/admin/buses/:id/editar', element: <BusFormPage /> }],
          },
          {
            element: <ProtectedRoute permiso={PERMISOS.paraderosVer} />,
            children: [{ path: '/admin/paraderos', element: <ParaderosListPage /> }],
          },
          {
            element: <ProtectedRoute permiso={PERMISOS.paraderosCrear} />,
            children: [{ path: '/admin/paraderos/nuevo', element: <ParaderoFormPage /> }],
          },
          {
            element: <ProtectedRoute permiso={PERMISOS.paraderosEditar} />,
            children: [
              { path: '/admin/paraderos/:id/editar', element: <ParaderoFormPage /> },
            ],
          },
          {
            element: <ProtectedRoute permiso={PERMISOS.rutasVer} />,
            children: [
              { path: '/admin/rutas', element: <RutasListPage /> },
              { path: '/admin/rutas/:id/puntos', element: <RutaPuntosPage /> },
            ],
          },
          {
            element: <ProtectedRoute permiso={PERMISOS.rutasCrear} />,
            children: [{ path: '/admin/rutas/nuevo', element: <RutaFormPage /> }],
          },
          {
            element: <ProtectedRoute permiso={PERMISOS.rutasEditar} />,
            children: [{ path: '/admin/rutas/:id/editar', element: <RutaFormPage /> }],
          },
          {
            element: <ProtectedRoute permiso={PERMISOS.rolesVer} />,
            children: [{ path: '/admin/roles', element: <RolesListPage /> }],
          },
          {
            element: <ProtectedRoute permiso={PERMISOS.rolesCrear} />,
            children: [{ path: '/admin/roles/nuevo', element: <RoleFormPage /> }],
          },
          {
            element: <ProtectedRoute permiso={PERMISOS.rolesEditar} />,
            children: [{ path: '/admin/roles/:id/editar', element: <RoleFormPage /> }],
          },
          {
            element: <ProtectedRoute permiso={PERMISOS.usuariosVer} />,
            children: [{ path: '/admin/usuarios', element: <UsuariosListPage /> }],
          },
        ],
      },
    ],
  },
  { path: '/', element: <Navigate to="/mapa" replace /> },
  { path: '*', element: <Navigate to="/mapa" replace /> },
])
