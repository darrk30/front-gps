import { useEffect, useRef, useState } from 'react'

const TAMANO_LOTE = 15

/** Revela una lista de a poco (en vez de montar todo el DOM de una) — el `sentinelRef` va al final de la lista renderizada; al entrar en pantalla, carga el siguiente lote. */
export function useCargaIncremental<T>(items: T[]) {
  // Arranca en TAMANO_LOTE una sola vez (al montar la página) — no se resetea
  // en cada refetch (el polling de 30s de useNotificaciones trae un array
  // nuevo por referencia todo el tiempo) para no hacer desaparecer de golpe
  // lo que el usuario ya bajó a cargar.
  const [cantidadVisible, setCantidadVisible] = useState(TAMANO_LOTE)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setCantidadVisible((actual) => Math.min(actual + TAMANO_LOTE, items.length))
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [items.length])

  return {
    visibles: items.slice(0, cantidadVisible),
    hayMas: cantidadVisible < items.length,
    sentinelRef,
  }
}
