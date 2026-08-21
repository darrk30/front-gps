import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import type { ValidationErrors } from '@/types/api'

/** Vuelca errores 422 del backend (data:{campo:[msg]}) sobre un formulario de react-hook-form. */
export function applyServerErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  errors: ValidationErrors,
) {
  for (const [field, messages] of Object.entries(errors)) {
    if (messages[0]) {
      setError(field as Path<T>, { type: 'server', message: messages[0] })
    }
  }
}

/**
 * Convierte un payload plano a FormData para envíos con archivo (multipart).
 * Los campos null/undefined se omiten (el backend los trata como ausentes),
 * y los booleanos se envían como '1'/'0' porque FormData solo admite strings/Blob.
 */
export function toFormData(payload: Record<string, unknown>): FormData {
  const formData = new FormData()
  for (const [key, value] of Object.entries(payload)) {
    if (value === null || value === undefined) continue
    if (value instanceof File) {
      formData.append(key, value)
    } else if (typeof value === 'boolean') {
      formData.append(key, value ? '1' : '0')
    } else {
      formData.append(key, String(value))
    }
  }
  return formData
}
