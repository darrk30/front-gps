import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LocationPicker } from '@/components/shared/LocationPicker'
import { ImageUploadField } from '@/components/shared/ImageUploadField'
import { getErrorMessage, getValidationErrors } from '@/lib/axios'
import { applyServerErrors } from '@/lib/forms'
import type { Paradero } from '@/types/api'
import { createParadero, updateParadero, type ParaderoPayload } from './api'
import { useParadero } from './hooks'

// Centro aproximado del campus de la UNPRG (Lambayeque, Perú).
const UNPRG_CENTER: [number, number] = [-6.7014, -79.9061]

const paraderoSchema = z.object({
  nombre: z.string().min(1, 'Ingresa el nombre.'),
  tipo: z.enum(['paradero', 'parada'], 'Selecciona un tipo.'),
  latitude: z.number('Selecciona la ubicación en el mapa.'),
  longitude: z.number('Selecciona la ubicación en el mapa.'),
  referencia: z.string(),
  activo: z.boolean(),
})

type ParaderoFormValues = z.infer<typeof paraderoSchema>

function toPayload(values: ParaderoFormValues): ParaderoPayload {
  return {
    nombre: values.nombre,
    tipo: values.tipo,
    latitude: values.latitude,
    longitude: values.longitude,
    referencia: values.referencia || null,
    activo: values.activo,
  }
}

function paraderoToDefaultValues(paradero: Paradero | null): Partial<ParaderoFormValues> {
  if (!paradero) {
    return { nombre: '', tipo: 'paradero', referencia: '', activo: true }
  }
  return {
    nombre: paradero.nombre,
    tipo: paradero.tipo,
    latitude: paradero.latitude,
    longitude: paradero.longitude,
    referencia: paradero.referencia ?? '',
    activo: paradero.activo,
  }
}

export function ParaderoFormPage() {
  const { id } = useParams()
  const paraderoId = id ? Number(id) : undefined
  const isEdit = paraderoId !== undefined

  const paraderoQuery = useParadero(paraderoId ?? Number.NaN)
  const isLoadingInitial = isEdit && paraderoQuery.isPending

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-lg font-semibold">{isEdit ? 'Editar paradero' : 'Nuevo paradero'}</h1>
        <p className="text-sm text-muted-foreground">
          {isEdit ? 'Actualiza la ubicación del paradero.' : 'Registra un nuevo punto de parada.'}
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          {isLoadingInitial ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            // Se monta una sola vez, ya con el dato confirmado (o null si es
            // "nuevo") — así el formulario nace con el defaultValues correcto
            // desde el principio y nunca necesita "corregirse" después vía
            // `reset()` en un efecto. Eso era justo lo que causaba que el
            // Select de "Tipo" se quedara mostrando el valor por defecto
            // ("Paradero") en vez del real cuando el paradero editado era una
            // "Parada" — el reset() posterior a veces no llegaba a tiempo
            // para el primer render en el que el <form> aparecía.
            <ParaderoForm isEdit={isEdit} paraderoId={paraderoId} paradero={paraderoQuery.data ?? null} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ParaderoForm({
  isEdit,
  paraderoId,
  paradero,
}: {
  isEdit: boolean
  paraderoId: number | undefined
  paradero: Paradero | null
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [foto, setFoto] = useState<File | null>(null)

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<ParaderoFormValues>({
    resolver: zodResolver(paraderoSchema),
    defaultValues: useMemo(() => paraderoToDefaultValues(paradero), [paradero]),
  })

  const latitude = watch('latitude')
  const longitude = watch('longitude')

  function handleLocationChange(lat: number, lng: number) {
    setValue('latitude', lat, { shouldValidate: true, shouldDirty: true })
    setValue('longitude', lng, { shouldValidate: true, shouldDirty: true })
  }

  const mutation = useMutation({
    mutationFn: (payload: ParaderoPayload) =>
      isEdit
        ? updateParadero(paraderoId as number, payload, foto)
        : createParadero(payload, foto),
    onSuccess: () => {
      toast.success(isEdit ? 'Paradero actualizado.' : 'Paradero registrado.')
      queryClient.invalidateQueries({ queryKey: ['paraderos'] })
      navigate('/admin/paraderos')
    },
    onError: (error) => {
      applyServerErrors(setError, getValidationErrors(error))
      toast.error(getErrorMessage(error))
    },
  })

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit((values) => mutation.mutate(toPayload(values)))}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="nombre">Nombre</Label>
          <Input id="nombre" disabled={mutation.isPending} {...register('nombre')} />
          {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Tipo</Label>
          <Controller
            control={control}
            name="tipo"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} disabled={mutation.isPending}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paradero">Paradero (parada oficial)</SelectItem>
                  <SelectItem value="parada">Parada (punto informal)</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.tipo && <p className="text-sm text-destructive">{errors.tipo.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="referencia">Referencia</Label>
          <Input id="referencia" disabled={mutation.isPending} {...register('referencia')} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>Ubicación</Label>
          <LocationPicker
            latitude={latitude}
            longitude={longitude}
            onChange={handleLocationChange}
            defaultCenter={UNPRG_CENTER}
            disabled={mutation.isPending}
          />
          {(errors.latitude || errors.longitude) && (
            <p className="text-sm text-destructive">
              {errors.latitude?.message ?? errors.longitude?.message}
            </p>
          )}
        </div>
        <div className="sm:col-span-2">
          <ImageUploadField
            label="Foto"
            currentUrl={paradero?.foto}
            file={foto}
            onFileChange={setFoto}
            disabled={mutation.isPending}
          />
        </div>
        <div className="flex items-center gap-2 pt-2 sm:col-span-2">
          <Controller
            control={control}
            name="activo"
            render={({ field }) => (
              <Switch
                id="activo"
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={mutation.isPending}
              />
            )}
          />
          <Label htmlFor="activo">Paradero activo</Label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          disabled={mutation.isPending}
          onClick={() => navigate('/admin/paraderos')}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && <Loader2 className="size-4 animate-spin" />}
          {isEdit ? 'Guardar cambios' : 'Registrar paradero'}
        </Button>
      </div>
    </form>
  )
}
