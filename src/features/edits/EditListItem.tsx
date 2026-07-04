import clsx from 'clsx'
import type { Edit } from '@/types/types'
import { StatusBadge } from '@/components/StatusBadge'
import { findUser } from '@/lib/seedUsers'
import { formatTimestamp } from '@/lib/formatDate'

interface EditListItemProps {
  edit: Edit
  active?: boolean
  onClick?: () => void
}

/** A compact summary row for an edit — reused in the queue, inbox, and history. */
export function EditListItem({ edit, active, onClick }: EditListItemProps) {
  const changeCount = edit.operations.length
  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium text-slate-700">{edit.title}</span>
        <StatusBadge status={edit.status} />
      </div>
      <div className="text-xs text-slate-400">
        by {findUser(edit.authorId)?.name ?? edit.authorId} · {changeCount} change
        {changeCount === 1 ? '' : 's'} · {formatTimestamp(edit.updatedAt)}
      </div>
    </>
  )

  const className = clsx(
    'w-full rounded border p-2 text-left',
    active ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white',
    onClick && 'transition-colors hover:bg-slate-50',
  )

  return onClick ? (
    <button onClick={onClick} className={className}>
      {body}
    </button>
  ) : (
    <div className={className}>{body}</div>
  )
}
