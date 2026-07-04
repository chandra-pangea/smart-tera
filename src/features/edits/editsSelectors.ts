import type { RootState } from '@/app/store'
import type { Edit } from '@/types/types'

export const selectAllEdits = (state: RootState): Edit[] => Object.values(state.edits.byId)

export const selectEditById = (state: RootState, id: string): Edit | undefined =>
  state.edits.byId[id]

export const selectActiveEdit = (state: RootState): Edit | undefined =>
  state.edits.activeEditId ? state.edits.byId[state.edits.activeEditId] : undefined

export const selectPendingEdits = (state: RootState): Edit[] =>
  selectAllEdits(state).filter((e) => e.status === 'pending_approval')

/** Field tasks awaiting a specific operator (assigned, no submission yet). */
export const selectFieldTasksForOperator = (state: RootState, operatorId: string): Edit[] =>
  selectAllEdits(state).filter(
    (e) => e.fieldTask?.assignedTo === operatorId && !e.fieldSubmission,
  )
