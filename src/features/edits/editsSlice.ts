import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type {
  AuditEntry,
  ChangeOperation,
  Edit,
  EditStatus,
  FieldSubmission,
  FieldTask,
  ThreadPost,
} from '@/types/types'

/**
 * All edits (draft / pending / approved / rejected) plus the id of the author's
 * current draft. This slice holds the entire history — operations, field
 * task/submission, thread, and audit trail — separate from the published
 * network.
 *
 * The reducers here are intentionally "dumb" (setters/pushers). All guards,
 * id/timestamp minting, and orchestration live in `editActions.ts` thunks, so
 * these reducers stay pure and deterministic.
 */
export interface EditsState {
  byId: Record<string, Edit>
  activeEditId: string | null
}

const initialState: EditsState = {
  byId: {},
  activeEditId: null,
}

const editsSlice = createSlice({
  name: 'edits',
  initialState,
  reducers: {
    upsertEdit(state, action: PayloadAction<Edit>) {
      state.byId[action.payload.id] = action.payload
    },
    removeEdit(state, action: PayloadAction<string>) {
      delete state.byId[action.payload]
      if (state.activeEditId === action.payload) state.activeEditId = null
    },
    setActiveEdit(state, action: PayloadAction<string | null>) {
      state.activeEditId = action.payload
    },
    /** Append an operation, coalescing repeated updates to the same element. */
    addOperation(
      state,
      action: PayloadAction<{ editId: string; operation: ChangeOperation; at: string }>,
    ) {
      const edit = state.byId[action.payload.editId]
      if (!edit) return
      const op = action.payload.operation
      if (op.kind === 'update') {
        const existing = edit.operations.find(
          (o): o is Extract<ChangeOperation, { kind: 'update' }> =>
            o.kind === 'update' && o.elementId === op.elementId,
        )
        if (existing) {
          existing.after = { ...existing.after, ...op.after }
        } else {
          edit.operations.push(op)
        }
      } else {
        edit.operations.push(op)
      }
      edit.updatedAt = action.payload.at
    },
    /** Patch an element that was ADDED in this draft (edit it in place, no update op). */
    patchAddedElement(
      state,
      action: PayloadAction<{ editId: string; elementId: string; patch: Record<string, unknown>; at: string }>,
    ) {
      const edit = state.byId[action.payload.editId]
      if (!edit) return
      const addOp = edit.operations.find(
        (o): o is Extract<ChangeOperation, { kind: 'add' }> =>
          o.kind === 'add' && o.element.id === action.payload.elementId,
      )
      if (addOp) {
        addOp.element = { ...addOp.element, ...action.payload.patch } as typeof addOp.element
        edit.updatedAt = action.payload.at
      }
    },
    /** Drop all add/update ops for an element (used when deleting a draft-local element). */
    dropElementOps(
      state,
      action: PayloadAction<{ editId: string; elementId: string; at: string }>,
    ) {
      const edit = state.byId[action.payload.editId]
      if (!edit) return
      edit.operations = edit.operations.filter((o) => {
        if (o.kind === 'add') return o.element.id !== action.payload.elementId
        if (o.kind === 'update' || o.kind === 'remove') return o.elementId !== action.payload.elementId
        return true
      })
      edit.updatedAt = action.payload.at
    },
    setFieldTask(state, action: PayloadAction<{ editId: string; fieldTask: FieldTask; at: string }>) {
      const edit = state.byId[action.payload.editId]
      if (!edit) return
      edit.fieldTask = action.payload.fieldTask
      // Re-assigning clears any prior submission.
      edit.fieldSubmission = undefined
      edit.updatedAt = action.payload.at
    },
    setFieldSubmission(
      state,
      action: PayloadAction<{ editId: string; submission: FieldSubmission; at: string }>,
    ) {
      const edit = state.byId[action.payload.editId]
      if (!edit) return
      edit.fieldSubmission = action.payload.submission
      edit.updatedAt = action.payload.at
    },
    setStatus(
      state,
      action: PayloadAction<{ editId: string; status: EditStatus; at: string; reason?: string }>,
    ) {
      const edit = state.byId[action.payload.editId]
      if (!edit) return
      edit.status = action.payload.status
      edit.rejectionReason =
        action.payload.status === 'rejected' ? action.payload.reason : undefined
      edit.updatedAt = action.payload.at
    },
    addThreadPost(state, action: PayloadAction<{ editId: string; post: ThreadPost }>) {
      state.byId[action.payload.editId]?.thread.push(action.payload.post)
    },
    addAuditEntry(state, action: PayloadAction<{ editId: string; entry: AuditEntry }>) {
      state.byId[action.payload.editId]?.audit.push(action.payload.entry)
    },
    resetEdits() {
      return initialState
    },
  },
})

export const editsActions = editsSlice.actions
export const editsReducer = editsSlice.reducer
