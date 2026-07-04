import type { Edit, FieldCondition } from '@/types/types'
import { findUser } from '@/lib/seedUsers'
import { formatTimestamp } from '@/lib/formatDate'
import { Badge } from '@/components/Badge'

const CONDITION_STYLE: Record<FieldCondition, string> = {
  good: 'bg-green-100 text-green-700',
  needs_attention: 'bg-amber-100 text-amber-700',
  faulty: 'bg-red-100 text-red-700',
}

export const CONDITION_LABEL: Record<FieldCondition, string> = {
  good: 'Good',
  needs_attention: 'Needs attention',
  faulty: 'Faulty',
}

/** Read-only view of a field task and its submission (for editor & admin). */
export function FieldSubmissionCard({ edit }: { edit: Edit }) {
  const task = edit.fieldTask
  if (!task) return null
  const submission = edit.fieldSubmission

  return (
    <div className="space-y-2 text-sm">
      <div>
        <div className="text-xs font-medium text-slate-500">Task instruction</div>
        <p className="text-slate-700">{task.instruction || '—'}</p>
        <div className="text-xs text-slate-400">
          Assigned to {findUser(task.assignedTo)?.name ?? task.assignedTo}
        </div>
      </div>

      {submission ? (
        <div className="space-y-1 rounded border border-slate-200 p-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Condition</span>
            <Badge className={CONDITION_STYLE[submission.condition]}>
              {CONDITION_LABEL[submission.condition]}
            </Badge>
          </div>
          <div>
            <span className="text-xs text-slate-500">Observed: </span>
            <span className="text-slate-700">{submission.observedValue || '—'}</span>
          </div>
          {submission.notes && <p className="text-slate-600">{submission.notes}</p>}
          {submission.photoDataUrl && (
            <img src={submission.photoDataUrl} alt="Field photo" className="max-h-32 rounded border" />
          )}
          <div className="text-xs text-slate-400">
            by {findUser(submission.submittedBy)?.name ?? submission.submittedBy} ·{' '}
            {formatTimestamp(submission.submittedAt)}
          </div>
        </div>
      ) : (
        <p className="text-xs text-amber-600">Awaiting operator submission.</p>
      )}
    </div>
  )
}
