import type { EditStatus } from '@/types/types'
import { Badge } from './Badge'

const STATUS_STYLES: Record<EditStatus, string> = {
  draft: 'bg-slate-100 text-slate-600',
  pending_approval: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

export const STATUS_LABELS: Record<EditStatus, string> = {
  draft: 'Draft',
  pending_approval: 'Pending approval',
  approved: 'Approved',
  rejected: 'Rejected',
}

export function StatusBadge({ status }: { status: EditStatus }) {
  return <Badge className={STATUS_STYLES[status]}>{STATUS_LABELS[status]}</Badge>
}
