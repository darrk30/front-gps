import { Link } from 'react-router-dom'
import { ArrowLeft, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function AcercaDePage() {
  return (
    <div className="mx-auto max-w-xl space-y-4 p-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/perfil">
          <ArrowLeft className="size-4" />
          Perfil
        </Link>
      </Button>

      <h1 className="text-lg font-semibold">Acerca de la app</h1>

      <Card>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MapPin className="size-5" />
            </span>
            <div>
              <p className="font-medium">UNPRG Bus Tracker</p>
              <p className="text-sm text-muted-foreground">Seguimiento de buses en tiempo real</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Proyecto de tesis para el seguimiento en tiempo real de los buses de la Universidad
            Nacional Pedro Ruiz Gallo.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
