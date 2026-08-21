import { useMemo } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import type { Permiso } from '@/types/api'

interface PermissionsChecklistProps {
  permisos: Permiso[]
  selected: string[]
  onToggle: (name: string, checked: boolean) => void
  disabled?: boolean
}

export function PermissionsChecklist({
  permisos,
  selected,
  onToggle,
  disabled,
}: PermissionsChecklistProps) {
  const grupos = useMemo(() => {
    const map = new Map<string, Permiso[]>()
    for (const permiso of permisos) {
      const grupo = map.get(permiso.modulo) ?? []
      grupo.push(permiso)
      map.set(permiso.modulo, grupo)
    }
    return [...map.entries()]
  }, [permisos])

  return (
    <div className="space-y-4">
      {grupos.map(([modulo, items]) => (
        <div key={modulo} className="space-y-2 rounded-md border p-3">
          <p className="text-sm font-medium">{modulo}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {items.map((permiso) => (
              <label key={permiso.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={selected.includes(permiso.name)}
                  disabled={disabled}
                  onCheckedChange={(checked) => onToggle(permiso.name, checked === true)}
                />
                {permiso.label}
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
