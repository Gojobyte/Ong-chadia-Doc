import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Role } from '@ong-chadia/shared'

interface UsersFilterProps {
  role: Role | undefined
  onRoleChange: (role: Role | undefined) => void
}

const roleOptions: { value: string; label: string }[] = [
  { value: 'ALL', label: 'Tous les rôles' },
  { value: Role.SUPER_ADMIN, label: 'Super Admin' },
  { value: Role.STAFF, label: 'Staff' },
  { value: Role.CONTRIBUTOR, label: 'Contributeur' },
  { value: Role.GUEST, label: 'Invité' },
]

export function UsersFilter({ role, onRoleChange }: UsersFilterProps) {
  return (
    <div className="flex items-center gap-4">
      <label className="text-sm font-medium text-slate-700">Filtrer par rôle:</label>
      <Select
        value={role || 'ALL'}
        onValueChange={(value: string) => {
          onRoleChange(value === 'ALL' ? undefined : (value as Role))
        }}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Sélectionner un rôle" />
        </SelectTrigger>
        <SelectContent>
          {roleOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
