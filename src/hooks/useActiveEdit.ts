import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectActiveEdit } from '@/features/edits/editsSelectors'
import { discardDraft, startNewDraft, submitForApproval } from '@/features/edits/editActions'

/** The author's current draft edit and the actions that operate on it. */
export function useActiveEdit() {
  const dispatch = useAppDispatch()
  const activeEdit = useAppSelector(selectActiveEdit)

  return {
    activeEdit,
    hasChanges: !!activeEdit && activeEdit.operations.length > 0,
    startNew: (title?: string) => dispatch(startNewDraft(title)),
    discard: (editId: string) => dispatch(discardDraft(editId)),
    submit: (editId: string) => dispatch(submitForApproval(editId)),
  }
}
