import { Image as ImageIcon } from 'lucide-react'
import type { ComponentType } from 'react'
import { cn } from '@/lib/utils'

interface ThumbnailProps {
  src?: string | null
  className?: string
  /** Ícono a mostrar cuando no hay `src` — por defecto un ícono genérico de imagen. */
  fallbackIcon?: ComponentType<{ className?: string }>
  fallbackClassName?: string
}

export function Thumbnail({
  src,
  className,
  fallbackIcon: FallbackIcon = ImageIcon,
  fallbackClassName,
}: ThumbnailProps) {
  return (
    <div
      className={cn(
        'flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted',
        className,
      )}
    >
      {src ? (
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        <FallbackIcon className={cn('size-4 text-muted-foreground', fallbackClassName)} />
      )}
    </div>
  )
}
