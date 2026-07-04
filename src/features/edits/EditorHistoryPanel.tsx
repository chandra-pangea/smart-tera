import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectCurrentUser } from '@/features/auth/authSelectors'
import { selectAllEdits } from '@/features/edits/editsSelectors'
import { reopenEdit } from '@/features/edits/editActions'
import { Panel } from '@/components/Panel'
import { Button } from '@/components/Button'
import { EditListItem } from './EditListItem'

/** The editor's submitted edits (pending / approved / rejected), with reopen. */
export function EditorHistoryPanel() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectCurrentUser)
  const mine = useAppSelector((s) =>
    selectAllEdits(s).filter((e) => e.authorId === user?.id && e.status !== 'draft'),
  )

  if (mine.length === 0) return null

  return (
    <Panel title="My submitted edits">
      <div className="space-y-2">
        {mine.map((edit) => (
          <div key={edit.id} className="space-y-1">
            <EditListItem edit={edit} />
            {edit.status === 'rejected' && (
              <div className="rounded bg-red-50 p-2 text-xs text-red-700">
                Rejected: {edit.rejectionReason || '—'}
                <div className="mt-1">
                  <Button size="sm" onClick={() => dispatch(reopenEdit(edit.id))}>
                    Reopen
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Panel>
  )
}
