import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { getErrorMessage } from '@/lib/axios'
import type { AlumnoAdmin } from '@/types/api'
import { deleteAlumno } from './api'

export function EliminarAlumnoButton({ alumno }: { alumno: AlumnoAdmin }) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => deleteAlumno(alumno.id),
    onSuccess: () => {
      toast.success('Alumno eliminado.')
      queryClient.invalidateQueries({ queryKey: ['alumnos'] })
      setOpen(false)
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  })

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="text-destructive hover:text-destructive"
        onClick={() => setOpen(true)}
        aria-label="Eliminar alumno"
      >
        <Trash2 className="size-3.5" />
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar a "{alumno.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Se borra su perfil de alumno, no su cuenta de acceso — si alguna vez inició sesión con
              Google, esa cuenta sigue existiendo, solo queda sin rol hasta que se le asigne uno de
              nuevo desde Usuarios.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={mutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
