import { BusFront, Flag, MapPin, type LucideIcon } from 'lucide-react'
import type { TipoNotificacion } from '@/types/api'

const TIPO_ICONO: Record<TipoNotificacion, LucideIcon> = {
  bus_cerca: BusFront,
  bus_en_paradero: Flag,
}

export function iconoParaTipo(tipo?: string | null): LucideIcon {
  return TIPO_ICONO[tipo as TipoNotificacion] ?? MapPin
}
