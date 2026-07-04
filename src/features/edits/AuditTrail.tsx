import type { AuditAction } from '@/types/types'
import { useAuditTrail } from '@/hooks/useAuditTrail'
import { findUser } from '@/lib/seedUsers'
import { formatTimestamp } from '@/lib/formatDate'

const ACTION_LABEL: Record<AuditAction, string> = {
  created: 'created the edit',
  element_added: 'added',
  element_updated: 'updated',
  element_removed: 'removed',
  assigned: 'assigned a field task',
  field_submitted: 'submitted field results',
  submitted_for_approval: 'submitted for approval',
  approved: 'approved & published',
  rejected: 'rejected',
  reopened: 'reopened',
  commented: 'commented',
}

/** A complete, readable record of who did what and when. */
export function AuditTrail({ editId }: { editId: string }) {
  const entries = useAuditTrail(editId)

  return (
    <ol className="space-y-1.5">
      {entries.map((entry) => (
        <li key={entry.id} className="flex gap-2 text-xs">
          <span className="whitespace-nowrap text-slate-400">{formatTimestamp(entry.at)}</span>
          <span className="text-slate-700">
            <span className="font-medium">{findUser(entry.actorId)?.name ?? entry.actorId}</span>{' '}
            {ACTION_LABEL[entry.action]}
            {entry.details ? <span className="text-slate-500"> — {entry.details}</span> : null}
          </span>
        </li>
      ))}
    </ol>
  )
}
