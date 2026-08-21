import { Outlet } from 'react-router-dom'
import { MapPin } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <MapPin className="size-6" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">UNPRG Bus Tracker</h1>
          <p className="text-sm text-muted-foreground">Rastreo de buses universitarios en tiempo real</p>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
