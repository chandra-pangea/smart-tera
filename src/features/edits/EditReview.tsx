import { useState } from 'react'
import type { Edit } from '@/types/types'
import { useDiff } from '@/hooks/useDiff'
import { useEditWorkflow } from '@/hooks/useEditWorkflow'
import { Panel } from '@/components/Panel'
import { Button } from '@/components/Button'
import { StatusBadge } from '@/components/StatusBadge'
import { Modal } from '@/components/Modal'
import { controlClass } from '@/components/controls'
import { DiffView } from './DiffView'
import { FieldSubmissionCard } from './FieldSubmissionCard'
import { ConversationThread } from './ConversationThread'
import { AuditTrail } from './AuditTrail'

/** The Admin's full review of one edit: diff, field input, thread, audit, actions. */
export function EditReview({ edit }: { edit: Edit }) {
  const diffs = useDiff(edit)
  const { approve, reject, canApprove } = useEditWorkflow(edit)
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')

  return (
    <div className="space-y-3">
      <Panel title="Proposed changes" actions={<StatusBadge status={edit.status} />}>
        <DiffView diffs={diffs} />
      </Panel>

      {edit.fieldTask && (
        <Panel title="Field verification">
          <FieldSubmissionCard edit={edit} />
        </Panel>
      )}

      <Panel title="Conversation">
        <ConversationThread editId={edit.id} />
      </Panel>

      <Panel title="Audit trail">
        <AuditTrail editId={edit.id} />
      </Panel>

      {canApprove && (
        <div className="flex flex-wrap gap-2">
          <Button variant="success" onClick={approve}>
            Approve &amp; publish
          </Button>
          <Button variant="danger" onClick={() => setRejecting(true)}>
            Reject
          </Button>
        </div>
      )}

      {rejecting && (
        <Modal title="Reject edit" onClose={() => setRejecting(false)}>
          <div className="space-y-3">
            <textarea
              className={controlClass}
              rows={3}
              placeholder="Reason for rejection (recorded and shown to the editor)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setRejecting(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  reject(reason)
                  setRejecting(false)
                }}
                disabled={!reason.trim()}
              >
                Reject edit
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
