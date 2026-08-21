import { useEffect, useState } from 'react'
import { api } from '@/lib/axios'
import { getEcho } from '@/lib/echo'
import type { ApiResponse, GpsLocation } from '@/types/api'

/** Trae la última coordenada de cada dispositivo para no arrancar en blanco. */
async function getUltimasLocations() {
  const { data } = await api.get<ApiResponse<GpsLocation[]>>('/gps/locations', { params: { limit: 500 } })
  return data.data
}

/**
 * Mapa device_id -> última coordenada conocida.
 *
 * Al montar, primero pide un batch por HTTP (GET /gps/locations) para tener
 * algo que mostrar de entrada — si solo se escuchara el WebSocket, la
 * pantalla arrancaba vacía hasta el próximo ping de cada bus (que puede
 * tardar varios segundos), dando la sensación de que tarda mucho en cargar.
 * De ahí en más, cada posición nueva llega por el canal público
 * "gps.locations" (evento ".location.updated") vía Reverb. Si
 * VITE_REVERB_APP_KEY no está configurada, getEcho() devuelve null y
 * simplemente no llegan actualizaciones en vivo (la carga inicial igual
 * funciona).
 */
export function useRealtimeLocations() {
  const [locations, setLocations] = useState<Record<string, GpsLocation>>({})

  useEffect(() => {
    let cancelado = false

    getUltimasLocations()
      .then((lista) => {
        if (cancelado || lista.length === 0) return
        setLocations((prev) => {
          const siguiente = { ...prev }
          for (const loc of lista) {
            const actual = siguiente[loc.device_id]
            // `id` es autoincremental — más confiable que parsear recorded_at
            // (que llega como "dd/mm/yyyy HH:mm:ss") para saber cuál es más nueva.
            if (!actual || loc.id > actual.id) siguiente[loc.device_id] = loc
          }
          return siguiente
        })
      })
      .catch(() => {
        // best-effort: si falla, el WebSocket igual va llenando esto a medida que lleguen pings.
      })

    const echo = getEcho()
    if (!echo) {
      return () => {
        cancelado = true
      }
    }

    echo.channel('gps.locations').listen('.location.updated', (loc: GpsLocation) => {
      setLocations((prev) => ({ ...prev, [loc.device_id]: loc }))
    })

    return () => {
      cancelado = true
      echo.leaveChannel('gps.locations')
    }
  }, [])

  return locations
}
