import { useRef } from 'react'
import type { PuntoRuta } from '@/types/api'
import { angularDiffDeg, bearingDeg, distanciaMetros } from '@/lib/geo'

export interface DireccionBus {
  /** Punto al que se dirige el bus ahora: el próximo paradero comprometido, o el último punto disponible si la ruta se acaba antes de llegar a uno. */
  destino: PuntoRuta
  /** true si `destino` es un paradero real (no el borde de la ruta sin haber llegado a uno todavía). */
  esParadero: boolean
  /** Puntos intermedios entre el bus y `destino`, en orden de recorrido — para dibujar la línea y las paradas. */
  tramo: PuntoRuta[]
  /** Distancia en línea recta, en metros, desde el bus hasta `tramo[0]` (el próximo punto, sea parada o paradero). */
  distanciaSiguienteM: number
  /** Distancia acumulada en línea recta, en metros, desde el bus hasta `destino` siguiendo `tramo`. */
  distanciaDestinoM: number
  /** Distancia acumulada en línea recta, en metros, desde el bus hasta cada punto de `tramo` (mismo índice) — para poder estimar el ETA a cualquier punto intermedio (parada), no solo al `destino` final. */
  distanciasM: number[]
}

interface Compromiso {
  busId: number
  ascendente: boolean
  destinoId: number
}

function distanciaCuadrada(a: [number, number], b: [number, number]) {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2
}

/**
 * El backend dejó de mandar sentido/próximo paradero (ver GpsLocation en
 * types/api.ts), así que se infiere en el front con heading + geometría —
 * pero con "memoria": el heading real de GPS es ruidoso, sobre todo a baja
 * velocidad, y recalcular la dirección desde cero en cada ping hacía que
 * "parpadeara" entre dos destinos distintos aunque el bus fuera en línea
 * recta. Acá, una vez que se decide hacia qué paradero va (comparando el
 * heading contra el rumbo hacia el punto siguiente/anterior en la secuencia),
 * esa decisión se mantiene — solo se recorta el tramo restante — hasta que
 * el bus realmente llega a ese paradero. Recién ahí se vuelve a evaluar el
 * heading para elegir el siguiente tramo.
 */
export function useDireccionEstable(
  puntosRuta: PuntoRuta[],
  busId: number | undefined,
  bus: { latitude: number; longitude: number } | undefined,
  heading: number | null,
): DireccionBus | null {
  const ref = useRef<Compromiso | null>(null)

  if (ref.current && ref.current.busId !== busId) {
    ref.current = null
  }

  if (!bus || busId == null || heading == null || puntosRuta.length < 2) {
    return null
  }

  const ordenados = [...puntosRuta].sort((a, b) => a.orden - b.orden)
  const posBus: [number, number] = [bus.latitude, bus.longitude]

  let idxCercano = 0
  let mejorDist = Number.POSITIVE_INFINITY
  ordenados.forEach((p, i) => {
    const d = distanciaCuadrada(posBus, [p.latitude, p.longitude])
    if (d < mejorDist) {
      mejorDist = d
      idxCercano = i
    }
  })

  let compromiso = ref.current
  if (compromiso) {
    const idxDestino = ordenados.findIndex((p) => p.id === compromiso!.destinoId)
    const vigente = idxDestino !== -1 && (compromiso.ascendente ? idxCercano < idxDestino : idxCercano > idxDestino)
    if (!vigente) compromiso = null
  }

  if (!compromiso) {
    const siguienteAsc = ordenados[idxCercano + 1]
    const siguienteDesc = ordenados[idxCercano - 1]
    if (!siguienteAsc && !siguienteDesc) {
      ref.current = null
      return null
    }

    let ascendente: boolean
    if (siguienteAsc && !siguienteDesc) {
      ascendente = true
    } else if (!siguienteAsc && siguienteDesc) {
      ascendente = false
    } else {
      const diffAsc = angularDiffDeg(heading, bearingDeg(posBus, [siguienteAsc.latitude, siguienteAsc.longitude]))
      const diffDesc = angularDiffDeg(heading, bearingDeg(posBus, [siguienteDesc.latitude, siguienteDesc.longitude]))
      ascendente = diffAsc <= diffDesc
    }

    const paso = ascendente ? 1 : -1
    let destino: PuntoRuta | undefined
    for (let i = idxCercano + paso; i >= 0 && i < ordenados.length; i += paso) {
      destino = ordenados[i]
      if (destino.tipo === 'paradero') break
    }
    if (!destino) {
      ref.current = null
      return null
    }

    compromiso = { busId, ascendente, destinoId: destino.id }
  }

  ref.current = compromiso

  const idxDestino = ordenados.findIndex((p) => p.id === compromiso.destinoId)
  const paso = compromiso.ascendente ? 1 : -1
  const tramo: PuntoRuta[] = []
  for (let i = idxCercano + paso; ; i += paso) {
    tramo.push(ordenados[i])
    if (i === idxDestino) break
  }

  const destinoPunto = ordenados[idxDestino]

  let acumuladoM = 0
  let anterior = posBus
  const distanciasM = tramo.map((punto) => {
    const actual: [number, number] = [punto.latitude, punto.longitude]
    acumuladoM += distanciaMetros(anterior, actual)
    anterior = actual
    return acumuladoM
  })

  return {
    destino: destinoPunto,
    esParadero: destinoPunto.tipo === 'paradero',
    tramo,
    distanciaSiguienteM: distanciasM[0],
    distanciaDestinoM: distanciasM[distanciasM.length - 1],
    distanciasM,
  }
}
