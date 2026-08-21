/**
 * Nombres de permisos tal como los expone la API (GET /permisos, User.permissions).
 * Fuente única para el sidebar (AppLayout) y el guard de rutas (ProtectedRoute) —
 * ninguno de los dos debe repetir estos literales por su cuenta.
 */
export const PERMISOS = {
  conductoresVer: 'conductores.ver',
  conductoresCrear: 'conductores.crear',
  conductoresEditar: 'conductores.editar',
  conductoresEliminar: 'conductores.eliminar',

  alumnosVer: 'alumnos.ver',
  alumnosCrear: 'alumnos.crear',
  alumnosEditar: 'alumnos.editar',
  alumnosEliminar: 'alumnos.eliminar',

  busesVer: 'buses.ver',
  busesCrear: 'buses.crear',
  busesEditar: 'buses.editar',
  busesEliminar: 'buses.eliminar',

  paraderosVer: 'paraderos.ver',
  paraderosCrear: 'paraderos.crear',
  paraderosEditar: 'paraderos.editar',
  paraderosEliminar: 'paraderos.eliminar',

  rolesVer: 'roles.ver',
  rolesCrear: 'roles.crear',
  rolesEditar: 'roles.editar',
  rolesEliminar: 'roles.eliminar',

  usuariosVer: 'usuarios.ver',
  usuariosEditar: 'usuarios.editar',

  rutasVer: 'rutas.ver',
  rutasCrear: 'rutas.crear',
  rutasEditar: 'rutas.editar',
  rutasEliminar: 'rutas.eliminar',

  /**
   * Solo-lectura para el rol alumno (vía el mapa) — separados de los `.ver`
   * de arriba, que son los que están ligados a crear/editar/eliminar y dan
   * acceso a la sección de administración de cada recurso. El backend ahora
   * acepta cualquiera de los dos (`.ver` o `.consultar`) en los mismos GET
   * (GET /buses, GET /paraderos, GET /rutas/{id}) — el front no necesita
   * llamar a un endpoint distinto, solo puede usar esto para mostrar/ocultar
   * cosas puntuales pensadas para alumno.
   */
  paraderosConsultar: 'paraderos.consultar',
  busesConsultar: 'buses.consultar',
  rutasConsultar: 'rutas.consultar',
} as const

/** Roles de los que depende el sistema: no se pueden renombrar ni eliminar. */
export const ROLES_PROTEGIDOS = ['admin', 'conductor', 'alumno']
