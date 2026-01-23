import { Badge } from '@/components/ui/badge'
import { Role } from '@ong-chadia/shared'

const roleConfig: Record<
  Role,
  { label: string; variant: 'success' | 'warning' | 'neutral' | 'error' }
> = {
  SUPER_ADMIN: { label: 'Super Admin', variant: 'error' },
  STAFF: { label: 'Staff', variant: 'success' },
  CONTRIBUTOR: { label: 'Contributeur', variant: 'warning' },
  GUEST: { label: 'Invité', variant: 'neutral' },
}

interface RoleBadgeProps {
  role: Role
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const config = roleConfig[role] || { label: role, variant: 'neutral' as const }
  return <Badge variant={config.variant}>{config.label}</Badge>
}
