import { useAppDispatch, useAppSelector } from '@/app/hooks'
import type { FieldCondition } from '@/types/types'
import { selectCurrentUser } from '@/features/auth/authSelectors'
import { selectAllEdits, selectFieldTasksForOperator } from '@/features/edits/editsSelectors'
import { submitFieldForm } from '@/features/edits/editActions'

/** The operator's inbox: tasks awaiting a submission, plus their completed ones. */
export function useFieldTask() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectCurrentUser)

  const tasks = useAppSelector((s) => (user ? selectFieldTasksForOperator(s, user.id) : []))
  const completed = useAppSelector((s) =>
    user ? selectAllEdits(s).filter((e) => e.fieldSubmission?.submittedBy === user.id) : [],
  )

  const submit = (params: {
    editId: string
    observedValue: string
    condition: FieldCondition
    notes: string
    photoDataUrl?: string
  }) => dispatch(submitFieldForm(params))

  return { tasks, completed, submit }
}
