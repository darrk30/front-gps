import { useEffect, useMemo, useRef } from 'react'
import { Image as ImageIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface ImageUploadFieldProps {
  label: string
  /** URL de la foto ya guardada (modo edición). */
  currentUrl?: string | null
  file: File | null
  onFileChange: (file: File | null) => void
  disabled?: boolean
}

export function ImageUploadField({
  label,
  currentUrl,
  file,
  onFileChange,
  disabled,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => (previewUrl ? URL.revokeObjectURL(previewUrl) : undefined), [previewUrl])

  const displayUrl = previewUrl ?? currentUrl ?? null

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
          {displayUrl ? (
            <img src={displayUrl} alt="" className="size-full object-cover" />
          ) : (
            <ImageIcon className="size-6 text-muted-foreground" />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            disabled={disabled}
            className="hidden"
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            {displayUrl ? 'Cambiar foto' : 'Subir foto'}
          </Button>
          {file && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={disabled}
              onClick={() => {
                onFileChange(null)
                if (inputRef.current) inputRef.current.value = ''
              }}
            >
              <X className="size-3.5" />
              <span className="sr-only">Quitar selección</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
