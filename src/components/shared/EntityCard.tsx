import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Thumbnail } from '@/components/shared/Thumbnail'

interface EntityCardField {
  label: string
  value: ReactNode
}

interface EntityCardProps {
  title: ReactNode
  subtitle?: ReactNode
  /** URL de una foto asociada (bus/conductor/paradero); se omite si no aplica. */
  image?: string | null
  status?: ReactNode
  action?: ReactNode
  fields?: EntityCardField[]
  extra?: ReactNode
}

/**
 * Presentación en tarjeta de una fila de listado, usada en md:hidden como
 * alternativa a <Table> en pantallas angostas (las tablas no son el patrón
 * de las apps móviles modernas: se rompen con scroll horizontal y texto
 * cortado). En md: y superior las páginas siguen usando <Table>.
 */
export function EntityCard({
  title,
  subtitle,
  image,
  status,
  action,
  fields = [],
  extra,
}: EntityCardProps) {
  return (
    <Card size="sm">
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {image !== undefined && <Thumbnail src={image} />}
            <div className="min-w-0">
              <p className="truncate font-medium">{title}</p>
              {subtitle && <p className="truncate text-sm text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {status}
            {action}
          </div>
        </div>

        {fields.length > 0 && (
          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
            {fields.map((field) => (
              <div key={field.label} className="min-w-0 space-y-0.5">
                <dt className="text-xs text-muted-foreground">{field.label}</dt>
                <dd className="truncate">{field.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {extra}
      </CardContent>
    </Card>
  )
}

export function EntityCardSkeleton() {
  return (
    <Card size="sm">
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="w-full space-y-1.5">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-6 w-14 shrink-0" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}
