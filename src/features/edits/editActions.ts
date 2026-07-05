import type { AppThunk } from '@/app/store'
import type {
  AuditAction,
  AuditEntry,
  Edit,
  FieldCondition,
  FieldSubmission,
  FieldTask,
  LngLat,
  NetworkElement,
  PropertyPatch,
  ThreadPost,
} from '@/types/types'
import { can } from '@/lib/permissions'
import { canTransition } from '@/lib/workflow'
import { applyOperations, buildRemoveOperations, isPipe } from '@/lib/operations'
import { buildSplitPipeOperations } from '@/lib/pipeSplit'
import { describeElement } from '@/lib/elements'
import { newId } from '@/lib/id'
import { nowIso } from '@/lib/formatDate'
import { findUser } from '@/lib/seedUsers'

import { editsActions } from './editsSlice'
import { selectActiveEdit } from './editsSelectors'
import { selectCurrentUser } from '../auth/authSelectors'
import { publishEdit, resetNetwork } from '../network/networkSlice'
import { resetUi, selectElement } from '../ui/uiSlice'

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function auditEntry(actorId: string, action: AuditAction, details?: string): AuditEntry {
  return { id: newId('a'), actorId, action, at: nowIso(), details }
}

/** Return the active draft's id, creating a new draft if there isn't one. */
const ensureActiveDraft = (): AppThunk<string | null> => (dispatch, getState) => {
  const active = selectActiveEdit(getState())
  if (active && active.status === 'draft') return active.id
  return dispatch(startNewDraft())
}

// ---------------------------------------------------------------------------
// Draft lifecycle
// ---------------------------------------------------------------------------

export const startNewDraft =
  (title?: string): AppThunk<string | null> =>
  (dispatch, getState) => {
    const user = selectCurrentUser(getState())
    if (!user || !can(user.role, 'edit_element')) return null // RBAC guard
    const at = nowIso()
    const id = newId('edit')
    const edit: Edit = {
      id,
      title: title?.trim() || `Edit ${id.slice(-4)}`,
      status: 'draft',
      authorId: user.id,
      operations: [],
      thread: [],
      audit: [auditEntry(user.id, 'created')],
      createdAt: at,
      updatedAt: at,
    }
    dispatch(editsActions.upsertEdit(edit))
    dispatch(editsActions.setActiveEdit(id))
    return id
  }

export const discardDraft =
  (editId: string): AppThunk =>
  (dispatch, getState) => {
    const edit = getState().edits.byId[editId]
    if (!edit || edit.status !== 'draft') return
    dispatch(editsActions.removeEdit(editId))
  }

// ---------------------------------------------------------------------------
// Element changes (all collected into the active draft, never applied to the
// published network directly)
// ---------------------------------------------------------------------------

export const addElement =
  (element: NetworkElement): AppThunk =>
  (dispatch, getState) => {
    const user = selectCurrentUser(getState())
    if (!user || !can(user.role, 'add_element')) return // RBAC guard
    const editId = dispatch(ensureActiveDraft())
    if (!editId) return
    dispatch(editsActions.addOperation({ editId, operation: { kind: 'add', element }, at: nowIso() }))
    dispatch(
      editsActions.addAuditEntry({
        editId,
        entry: auditEntry(user.id, 'element_added', describeElement(element)),
      }),
    )
    dispatch(selectElement(element.id))
  }

export const editElementProperties =
  (elementId: string, after: PropertyPatch): AppThunk =>
  (dispatch, getState) => {
    const state = getState()
    const user = selectCurrentUser(state)
    if (!user || !can(user.role, 'edit_element')) return // RBAC guard
    const editId = dispatch(ensureActiveDraft())
    if (!editId) return

    const draft = getState().edits.byId[editId]!
    // If the element was added in THIS draft, patch it in place (no update op).
    const addedHere = draft.operations.some((o) => o.kind === 'add' && o.element.id === elementId)
    if (addedHere) {
      dispatch(editsActions.patchAddedElement({ editId, elementId, patch: after, at: nowIso() }))
      return
    }

    const current = state.network.elements[elementId]
    if (!current) return
    const before: PropertyPatch = {}
    for (const key of Object.keys(after)) {
      before[key] = (current as unknown as Record<string, unknown>)[key]
    }
    const hadUpdate = draft.operations.some((o) => o.kind === 'update' && o.elementId === elementId)
    dispatch(
      editsActions.addOperation({
        editId,
        operation: { kind: 'update', elementId, before, after },
        at: nowIso(),
      }),
    )
    if (!hadUpdate) {
      dispatch(
        editsActions.addAuditEntry({
          editId,
          entry: auditEntry(user.id, 'element_updated', describeElement(current)),
        }),
      )
    }
  }

export const removeElement =
  (elementId: string): AppThunk =>
  (dispatch, getState) => {
    const state = getState()
    const user = selectCurrentUser(state)
    if (!user || !can(user.role, 'remove_element')) return // RBAC guard
    const editId = dispatch(ensureActiveDraft())
    if (!editId) return

    const draft = getState().edits.byId[editId]!
    const view = applyOperations(state.network, draft.operations)
    const cascade = buildRemoveOperations(view, elementId)

    for (const op of cascade) {
      if (op.kind !== 'remove') continue
      const addedHere = draft.operations.some(
        (o) => o.kind === 'add' && o.element.id === op.elementId,
      )
      if (addedHere) {
        // It only existed in the draft — just drop its ops.
        dispatch(editsActions.dropElementOps({ editId, elementId: op.elementId, at: nowIso() }))
      } else {
        dispatch(editsActions.addOperation({ editId, operation: op, at: nowIso() }))
      }
      dispatch(
        editsActions.addAuditEntry({
          editId,
          entry: auditEntry(user.id, 'element_removed', describeElement(op.snapshot)),
        }),
      )
    }
    dispatch(selectElement(null))
  }

export const splitPipeAt =
  (pipeId: string, coord: LngLat): AppThunk =>
  (dispatch, getState) => {
    const state = getState()
    const user = selectCurrentUser(state)
    if (!user || !can(user.role, 'add_element')) return // RBAC guard
    const editId = dispatch(ensureActiveDraft())
    if (!editId) return

    const draft = getState().edits.byId[editId]!
    const view = applyOperations(state.network, draft.operations)
    const pipe = view.elements[pipeId]
    if (!pipe || !isPipe(pipe)) return

    const { operations, junction } = buildSplitPipeOperations(pipe, coord)
    for (const op of operations) {
      if (op.kind === 'remove') {
        const addedHere = draft.operations.some(
          (o) => o.kind === 'add' && o.element.id === op.elementId,
        )
        if (addedHere) {
          dispatch(editsActions.dropElementOps({ editId, elementId: op.elementId, at: nowIso() }))
          continue
        }
      }
      dispatch(editsActions.addOperation({ editId, operation: op, at: nowIso() }))
    }
    dispatch(
      editsActions.addAuditEntry({
        editId,
        entry: auditEntry(user.id, 'element_updated', `Split ${describeElement(pipe)}`),
      }),
    )
    dispatch(selectElement(junction.id))
  }

// ---------------------------------------------------------------------------
// Field task & operator form
// ---------------------------------------------------------------------------

export const assignFieldTask =
  (params: {
    editId: string
    operatorId: string
    instruction: string
    targetElementId?: string
  }): AppThunk =>
  (dispatch, getState) => {
    const user = selectCurrentUser(getState())
    if (!user || !can(user.role, 'assign_field_task')) return // RBAC guard
    const at = nowIso()
    const fieldTask: FieldTask = {
      assignedTo: params.operatorId,
      instruction: params.instruction,
      targetElementId: params.targetElementId,
      assignedBy: user.id,
      assignedAt: at,
    }
    dispatch(editsActions.setFieldTask({ editId: params.editId, fieldTask, at }))
    dispatch(
      editsActions.addAuditEntry({
        editId: params.editId,
        entry: auditEntry(user.id, 'assigned', `to ${findUser(params.operatorId)?.name ?? params.operatorId}`),
      }),
    )
  }

export const submitFieldForm =
  (params: {
    editId: string
    observedValue: string
    condition: FieldCondition
    notes: string
    photoDataUrl?: string
  }): AppThunk =>
  (dispatch, getState) => {
    const state = getState()
    const user = selectCurrentUser(state)
    if (!user || !can(user.role, 'submit_field_form')) return // RBAC guard
    const edit = state.edits.byId[params.editId]
    if (!edit || edit.fieldTask?.assignedTo !== user.id) return // only the assignee
    const at = nowIso()
    const submission: FieldSubmission = {
      observedValue: params.observedValue,
      condition: params.condition,
      notes: params.notes,
      photoDataUrl: params.photoDataUrl,
      submittedBy: user.id,
      submittedAt: at,
    }
    dispatch(editsActions.setFieldSubmission({ editId: params.editId, submission, at }))
    dispatch(
      editsActions.addAuditEntry({
        editId: params.editId,
        entry: auditEntry(user.id, 'field_submitted', `${params.condition}: ${params.observedValue}`),
      }),
    )
  }

// ---------------------------------------------------------------------------
// Approval workflow (guarded by the workflow state machine + capability)
// ---------------------------------------------------------------------------

export const submitForApproval =
  (editId: string): AppThunk =>
  (dispatch, getState) => {
    const state = getState()
    const user = selectCurrentUser(state)
    const edit = state.edits.byId[editId]
    if (!user || !edit) return
    if (!canTransition(edit.status, 'pending_approval', user.role)) return // guard
    if (edit.operations.length === 0) return // nothing to review
    const at = nowIso()
    dispatch(editsActions.setStatus({ editId, status: 'pending_approval', at }))
    dispatch(editsActions.addAuditEntry({ editId, entry: auditEntry(user.id, 'submitted_for_approval') }))
    if (state.edits.activeEditId === editId) dispatch(editsActions.setActiveEdit(null))
  }

export const approveEdit =
  (editId: string): AppThunk =>
  (dispatch, getState) => {
    const state = getState()
    const user = selectCurrentUser(state)
    const edit = state.edits.byId[editId]
    if (!user || !edit) return
    if (!canTransition(edit.status, 'approved', user.role)) return // guard
    const at = nowIso()
    dispatch(publishEdit(edit.operations)) // merge into the published network
    dispatch(editsActions.setStatus({ editId, status: 'approved', at }))
    dispatch(editsActions.addAuditEntry({ editId, entry: auditEntry(user.id, 'approved') }))
  }

export const rejectEdit =
  (editId: string, reason: string): AppThunk =>
  (dispatch, getState) => {
    const state = getState()
    const user = selectCurrentUser(state)
    const edit = state.edits.byId[editId]
    if (!user || !edit) return
    if (!canTransition(edit.status, 'rejected', user.role)) return // guard
    const at = nowIso()
    dispatch(editsActions.setStatus({ editId, status: 'rejected', at, reason }))
    dispatch(editsActions.addAuditEntry({ editId, entry: auditEntry(user.id, 'rejected', reason) }))
  }

export const reopenEdit =
  (editId: string): AppThunk =>
  (dispatch, getState) => {
    const state = getState()
    const user = selectCurrentUser(state)
    const edit = state.edits.byId[editId]
    if (!user || !edit) return
    if (edit.status !== 'rejected') return // reopen is for rejected edits
    if (!canTransition(edit.status, 'draft', user.role)) return // guard
    const at = nowIso()
    dispatch(editsActions.setStatus({ editId, status: 'draft', at }))
    dispatch(editsActions.addAuditEntry({ editId, entry: auditEntry(user.id, 'reopened') }))
    dispatch(editsActions.setActiveEdit(editId))
  }


// ---------------------------------------------------------------------------
// Conversation & demo reset
// ---------------------------------------------------------------------------

export const postComment =
  (editId: string, body: string): AppThunk =>
  (dispatch, getState) => {
    const user = selectCurrentUser(getState())
    if (!user || !can(user.role, 'post_comment') || !body.trim()) return // RBAC guard
    const post: ThreadPost = {
      id: newId('c'),
      authorId: user.id,
      role: user.role,
      body: body.trim(),
      createdAt: nowIso(),
    }
    dispatch(editsActions.addThreadPost({ editId, post }))
  }

/** Restore seed network + clear all edits/UI (demo reset). */
export const resetDemo = (): AppThunk => (dispatch) => {
  dispatch(resetNetwork())
  dispatch(editsActions.resetEdits())
  dispatch(resetUi())
}
