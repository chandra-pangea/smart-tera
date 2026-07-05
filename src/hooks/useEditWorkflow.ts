import { useAppDispatch } from '@/app/hooks'
import type { Edit } from '@/types/types'
import { usePermissions } from './usePermissions'
import { availableTransitions, canTransition } from '@/lib/workflow'
import {
  approveEdit,
  assignFieldTask,
  rejectEdit,
  reopenEdit,
  submitForApproval,
} from '@/features/edits/editActions'

/**
 * Permission- and state-guarded workflow actions for a given edit, plus the
 * transitions currently available to the logged-in role. The buttons in the UI
 * are driven entirely by `transitions`, so they can't offer an illegal move.
 */
export function useEditWorkflow(edit?: Edit) {
  const dispatch = useAppDispatch()
  const { role } = usePermissions()

  const transitions = edit ? availableTransitions(edit.status, role) : []

  return {
    transitions,
    canApprove: !!edit && canTransition(edit.status, 'approved', role),
    submit: () => edit && dispatch(submitForApproval(edit.id)),
    approve: () => edit && dispatch(approveEdit(edit.id)),
    reject: (reason: string) => edit && dispatch(rejectEdit(edit.id, reason)),
    reopen: () => edit && dispatch(reopenEdit(edit.id)),
    assign: (params: { operatorId: string; instruction: string; targetElementId?: string }) =>
      edit && dispatch(assignFieldTask({ editId: edit.id, ...params })),
  }
}
