/**
 * Forma estándar de TODAS las respuestas de la API Laravel.
 */
export interface ApiResponse<T> {
  success: boolean
  code: number
  message: string
  data: T
}

/** data:{ campo: ["mensaje", ...] } en errores 422 */
export type ValidationErrors = Record<string, string[]>

export interface Alumno {
  id: number
  codigo: string | null
}

export interface User {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  password_temporal: boolean
  roles: string[]
  permissions: string[]
  alumno: Alumno | null
  /** null si el usuario no tiene perfil de conductor (admin, alumno, etc.). */
  conductor: { id: number; bus_id: number | null } | null
}

export interface Conductor {
  id: number
  user_id?: number
  dni: string
  nombres: string
  apellidos: string
  telefono: string | null
  email: string
  licencia_numero: string
  licencia_categoria: string
  licencia_vencimiento: string
  foto: string | null
  activo: boolean
}

/**
 * Alumno tal como lo gestiona el admin (GET/POST/PUT /alumnos) — no confundir
 * con el `Alumno` embebido en `User` (más chico, solo `id`/`codigo`). Un
 * alumno puede llegar acá vía auto-registro con Google (con `codigo: null`
 * hasta que él mismo lo completa desde su perfil) o dado de alta manualmente
 * por el admin (ahí `codigo` es obligatorio desde el alta).
 */
export interface AlumnoAdmin {
  id: number
  codigo: string | null
  user_id: number
  name: string
  email: string
  activo: boolean
}

export type TipoPuntoRuta = 'paradero' | 'parada'

export interface Paradero {
  id: number
  nombre: string
  tipo: TipoPuntoRuta
  latitude: number
  longitude: number
  referencia: string | null
  foto: string | null
  activo: boolean
}

/** Ficha del paradero tal como viaja embebida en un punto de ruta (GET /rutas/{id}). */
export interface PuntoRutaParadero {
  id: number
  nombre: string
  tipo: TipoPuntoRuta
  referencia: string | null
  foto: string | null
}

/** Un punto de la secuencia ordenada de una ruta — siempre referencia un `Paradero` real. */
export interface PuntoRuta {
  id: number
  orden: number
  tipo: TipoPuntoRuta
  nombre: string
  latitude: number
  longitude: number
  paradero: PuntoRutaParadero
}

export interface Ruta {
  id: number
  nombre: string
  activo: boolean
}

/** Ruta tal como viaja embebida en Bus — solo lo mínimo para mostrarla. */
export interface RutaResumen {
  id: number
  nombre: string
}

/** GET /rutas/{id}: la ruta junto con sus puntos ordenados. */
export interface RutaDetalle extends Ruta {
  puntos: PuntoRuta[]
}

export interface Bus {
  id: number
  placa: string
  device_id: string | null
  conductor_id: number | null
  conductor: Pick<Conductor, 'id' | 'nombres' | 'apellidos'> | null
  capacidad: number
  modelo: string
  anio: number
  color: string
  foto: string | null
  activo: boolean
  compartir_ubicacion: boolean
  /** null si el bus no tiene una ruta asignada. */
  ruta_id: number | null
  ruta: RutaResumen | null
}

export interface Permiso {
  id: number
  name: string
  label: string
  modulo: string
}

/** Permiso con el flag de si el rol consultado ya lo tiene asignado (GET /api/roles/{id}) */
export interface PermisoConAsignacion extends Permiso {
  asignado: boolean
}

export interface Role {
  id: number
  name: string
  permissions: Permiso[]
}

/** GET /api/roles/{id} devuelve el rol junto con TODOS los permisos del sistema marcados */
export interface RoleDetalle {
  id: number
  name: string
  permissions: PermisoConAsignacion[]
}

/**
 * Payload crudo de posición — vía WebSocket (`location.updated`) o
 * GET /gps/locations. El backend ya no calcula progreso de ruta (sentido,
 * próximo punto, ETA): eso se infiere en el front con `Bus.ruta_id` +
 * heading (ver features/mapa/useDireccionEstable.ts).
 */
export interface GpsLocation {
  id: number
  device_id: string
  latitude: number
  longitude: number
  speed: number | null
  /** Rumbo (Course Over Ground) en grados, 0-360, 0 = Norte, sentido horario. null si el bus está detenido. */
  heading: number | null
  recorded_at: string
}

export type TipoNotificacion = 'bus_cerca' | 'bus_en_paradero'

export interface Notificacion {
  id: number
  tipo: TipoNotificacion
  titulo: string
  mensaje: string
  /** IDs relacionados, siempre como string (ej. para armar un link a /paraderos/{data.paradero_id}). */
  data: { bus_id?: string; paradero_id?: string } & Record<string, string>
  leida: boolean
  created_at: string
}

/** GET /favoritos: paraderos marcados como favoritos por el alumno logueado. */
export interface Favorito {
  id: number
  paradero: Paradero
}
