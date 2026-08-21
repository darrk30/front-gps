const formatoFechaHora = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'America/Lima',
})

/**
 * El backend manda `created_at` en UTC (formato ISO por defecto de Laravel) —
 * hay que convertirlo a hora de Perú antes de mostrarlo, si no queda 5 horas
 * adelantado. Fijamos el timeZone explícito (en vez de usar el del
 * dispositivo) porque la app es de uso local en Lima, sin importar cómo esté
 * configurado el reloj del navegador de quien la abre.
 */
export function formatFechaHora(iso: string): string {
  const fecha = new Date(iso)
  if (Number.isNaN(fecha.getTime())) return iso
  return formatoFechaHora.format(fecha)
}
