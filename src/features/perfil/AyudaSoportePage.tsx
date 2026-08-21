import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function AyudaSoportePage() {
  return (
    <div className="mx-auto max-w-xl space-y-4 p-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/perfil">
          <ArrowLeft className="size-4" />
          Perfil
        </Link>
      </Button>

      <h1 className="text-lg font-semibold">Ayuda y soporte</h1>

      <Card>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Si tenés un problema con tu cuenta, con el mapa en tiempo real o con cualquier otra
            parte de la app, comunicate con el administrador del sistema de tu facultad.
          </p>
          <p>Si sos conductor y no podés compartir tu ubicación, revisá primero tu conexión a internet.</p>
        </CardContent>
      </Card>
    </div>
  )
}
