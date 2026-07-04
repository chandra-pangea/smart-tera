import { useState } from 'react'
import { useAppSelector } from '@/app/hooks'
import { useActiveEdit } from '@/hooks/useActiveEdit'
import { useDiff } from '@/hooks/useDiff'
import { usePermissions } from '@/hooks/usePermissions'
import { Panel } from '@/components/Panel'
import { Button } from '@/components/Button'
import { StatusBadge } from '@/components/StatusBadge'
import { EmptyState } from '@/components/EmptyState'
import { DiffView } from './DiffView'
import { AssignFieldTaskForm } from './AssignFieldTaskForm'
import { ConversationThread } from './ConversationThread'
import { FieldSubmissionCard } from './FieldSubmissionCard'

/** The author's current draft: its diff, and the actions to move it forward. */
export function ActiveEditPanel() {
  const { activeEdit, hasChanges, discard, submit } = useActiveEdit()
  const diffs = useDiff(activeEdit)
  const { can, role } = usePermissions()
  const selectedId = useAppSelector((s) => s.ui.selectedElementId)
  const [assignOpen, setAssignOpen] = useState(false)

  if (!activeEdit) {
    return (
      <Panel title="Current edit">
        <EmptyState
          title="No draft yet"
          hint="Change a property or add an element on the map to start an edit."
        />
      </Panel>
    )
  }

  return (
    <>
      <Panel title="Current edit" actions={<StatusBadge status={activeEdit.status} />}>
      <div className="space-y-3">
        <div className="text-xs text-slate-500">{activeEdit.title}</div>
        <DiffView diffs={diffs} />

        {activeEdit.fieldTask && (
          <div className="rounded border border-slate-200 p-2">
            <div className="mb-1 text-xs font-medium text-slate-500">Field verification</div>
            <FieldSubmissionCard edit={activeEdit} />
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {can('assign_field_task') && (
            <Button size="sm" onClick={() => setAssignOpen(true)} disabled={!hasChanges}>
              Assign field task
            </Button>
          )}
          {can('submit_for_approval') && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => submit(activeEdit.id)}
              disabled={!hasChanges}
            >
              {role === 'admin' ? 'Submit' : 'Submit for approval'}
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => discard(activeEdit.id)}>
            Discard
          </Button>
        </div>
      </div>

      {assignOpen && (
        <AssignFieldTaskForm
          editId={activeEdit.id}
          targetElementId={selectedId ?? undefined}
          onClose={() => setAssignOpen(false)}
        />
      )}
      </Panel>

      <Panel title="Conversation">
        <ConversationThread editId={activeEdit.id} />
      </Panel>
    </>
  )
}
