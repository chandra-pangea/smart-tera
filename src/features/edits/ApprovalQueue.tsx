import { useAppSelector } from '@/app/hooks'
import { selectAllEdits, selectPendingEdits } from '@/features/edits/editsSelectors'
import { Panel } from '@/components/Panel'
import { EmptyState } from '@/components/EmptyState'
import { EditListItem } from './EditListItem'

interface ApprovalQueueProps {
  selectedId: string | null
  onSelect: (id: string) => void
}

export function ApprovalQueue({ selectedId, onSelect }: ApprovalQueueProps) {
  const pending = useAppSelector(selectPendingEdits)
  const recent = useAppSelector((s) =>
    selectAllEdits(s).filter((e) => e.status === 'approved' || e.status === 'rejected'),
  )

  return (
    <>
      <Panel title={`Pending approval (${pending.length})`}>
        {pending.length === 0 ? (
          <EmptyState title="Nothing to review" hint="Submitted edits will appear here." />
        ) : (
          <div className="space-y-2">
            {pending.map((edit) => (
              <EditListItem
                key={edit.id}
                edit={edit}
                active={edit.id === selectedId}
                onClick={() => onSelect(edit.id)}
              />
            ))}
          </div>
        )}
      </Panel>

      {recent.length > 0 && (
        <Panel title="Recent decisions">
          <div className="space-y-2">
            {recent
              .slice(-5)
              .reverse()
              .map((edit) => (
                <EditListItem
                  key={edit.id}
                  edit={edit}
                  active={edit.id === selectedId}
                  onClick={() => onSelect(edit.id)}
                />
              ))}
          </div>
        </Panel>
      )}
    </>
  )
}
