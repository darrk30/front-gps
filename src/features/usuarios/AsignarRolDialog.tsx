import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, UserCog } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getErrorMessage } from '@/lib/axios'
import { useRoles } from '@/features/roles/hooks'
import type { User } from '@/types/api'
import { assignRole } from './api'

export function AsignarRolDialog({ usuario }: { usuario: User }) {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState(usuario.roles[0] ?? '')
  const rolesQuery = useRoles()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => assignRole(usuario.id, role),
    onSuccess: () => {
      toast.success('Rol asignado correctamente.')
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      setOpen(false)
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) setRole(usuario.roles[0] ?? '')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <UserCog className="size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar rol</DialogTitle>
          <DialogDescription>
            {usuario.name} · {usuario.email}
          </DialogDescription>
        </DialogHeader>

        <Select
          value={role}
          onValueChange={setRole}
          disabled={mutation.isPending || rolesQuery.isPending}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona un rol" />
          </SelectTrigger>
          <SelectContent>
            {rolesQuery.data?.map((r) => (
              <SelectItem key={r.id} value={r.name}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DialogFooter>
          <Button variant="outline" disabled={mutation.isPending} onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button disabled={!role || mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
