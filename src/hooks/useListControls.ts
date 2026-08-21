import { useEffect, useState } from 'react'

/**
 * Búsqueda + paginación client-side para las 5 páginas de listado admin.
 * Los datasets vienen completos de la API (sin paginación server-side), así
 * que filtrar/paginar en el front es suficiente y evita tocar el backend.
 */
export function useListControls<T>(
  items: T[] | undefined,
  predicate: (item: T, query: string) => boolean,
  pageSize = 8,
) {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [query])

  const all = items ?? []
  const trimmed = query.trim().toLowerCase()
  const filtered = trimmed ? all.filter((item) => predicate(item, trimmed)) : all

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const page_ = Math.min(page, pageCount)
  const paged = filtered.slice((page_ - 1) * pageSize, page_ * pageSize)

  return {
    query,
    setQuery,
    page: page_,
    setPage,
    pageCount,
    pageSize,
    total: filtered.length,
    paged,
  }
}
