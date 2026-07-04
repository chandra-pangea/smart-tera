import type { Role } from '@/types/types'
import { Badge } from './Badge'

const ROLE_STYLES: Record<Role, string> = {
  admin: 'bg-violet-100 text-violet-700',
  editor: 'bg-blue-100 text-blue-700',
  operator: 'bg-teal-100 text-teal-700',
}

export function RoleBadge({ role }: { role: Role }) {
  return <Badge className={ROLE_STYLES[role]}>{role}</Badge>
}
