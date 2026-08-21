import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface ListSearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function ListSearchInput({ value, onChange, placeholder = 'Buscar...' }: ListSearchInputProps) {
  return (
    <div className="relative w-full sm:max-w-xs">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-8"
      />
    </div>
  )
}
