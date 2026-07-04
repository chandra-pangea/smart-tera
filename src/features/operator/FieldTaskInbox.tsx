import { useState } from 'react'
import type { Edit } from '@/types/types'
import { useAppDispatch } from '@/app/hooks'
import { useFieldTask } from '@/hooks/useFieldTask'
import { selectElement } from '@/features/ui/uiSlice'
import { Panel } from '@/components/Panel'
import { EmptyState } from '@/components/EmptyState'
import { EditListItem } from '@/features/edits/EditListItem'
import { ConversationThread } from '@/features/edits/ConversationThread'
import { FieldForm } from './FieldForm'

/**
 * The operator's workspace: tasks assigned to them. Opening a task highlights
 * its target element on the map first (map-first), then shows the field form.
 */
export function FieldTaskInbox() {
  const { tasks, completed } = useFieldTask()
  const dispatch = useAppDispatch()
  const [openId, setOpenId] = useState<string | null>(null)

  const openTask = (edit: Edit) => {
    setOpenId(edit.id)
    if (edit.fieldTask?.targetElementId) {
      dispatch(selectElement(edit.fieldTask.targetElementId))
    }
  }

  const openEdit = tasks.find((t) => t.id === openId)

  return (
    <>
      <Panel title={`My field tasks (${tasks.length})`}>
        {tasks.length === 0 ? (
          <EmptyState title="No tasks assigned" hint="An editor will dispatch field tasks here." />
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <EditListItem
                key={task.id}
                edit={task}
                active={task.id === openId}
                onClick={() => openTask(task)}
              />
            ))}
          </div>
        )}
      </Panel>

      {openEdit && (
        <>
          <Panel title="Field form">
            <FieldForm edit={openEdit} onDone={() => setOpenId(null)} />
          </Panel>
          <Panel title="Conversation">
            <ConversationThread editId={openEdit.id} />
          </Panel>
        </>
      )}

      {completed.length > 0 && (
        <Panel title={`Completed (${completed.length})`}>
          <div className="space-y-2">
            {completed.map((edit) => (
              <EditListItem key={edit.id} edit={edit} />
            ))}
          </div>
        </Panel>
      )}
    </>
  )
}
