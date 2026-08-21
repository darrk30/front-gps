import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, MapPin, MapPinOff } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/lib/axios'
import { useAuthStore } from '@/features/auth/auth-store'
import { useBus } from '@/features/buses/hooks'
import { updateUbicacion } from '@/features/buses/api'

/**
 * Switch para que el conductor logueado active/desactive la difusión en
 * vivo de su propio bus. Solo se muestra si el usuario tiene perfil de
 * conductor con un bus asignado (User.conductor.bus_id).
 */
export function UbicacionToggle() {
  const user = useAuthStore((s) => s.user)
  const busId = user?.conductor?.bus_id ?? null
  const queryClient = useQueryClient()

  const busQuery = useBus(busId ?? Number.NaN)

  const mutation = useMutation({
    mutationFn: (compartir: boolean) => updateUbicacion(busId as number, compartir),
    onSuccess: (bus) => {
      queryClient.setQueryData(['buses', busId], bus)
      toast.success(
        bus.compartir_ubicacion ? 'Ahora estás compartiendo tu ubicación.' : 'Ubicación oculta.',
      )
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  if (busId == null) return null

  const compartiendo = mutation.isPending
    ? !busQuery.data?.compartir_ubicacion
    : (busQuery.data?.compartir_ubicacion ?? false)

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-1.5"
      disabled={busQuery.isPending || mutation.isPending}
      onClick={() => mutation.mutate(!busQuery.data?.compartir_ubicacion)}
    >
      {mutation.isPending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : compartiendo ? (
        <MapPin className="size-3.5 text-emerald-600" />
      ) : (
        <MapPinOff className="size-3.5 text-muted-foreground" />
      )}
      <span className="hidden sm:inline">
        {compartiendo ? 'Compartiendo ubicación' : 'Ubicación oculta'}
      </span>
    </Button>
  )
}
