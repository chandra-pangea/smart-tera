import type { EditStatus, Role } from '@/types/types'
import { can, type Capability } from './permissions'

/**
 * The Edit lifecycle as an explicit state machine. Only the transitions listed
 * here are legal, and each is gated by a capability. Field verification is a
 * sub-state of `draft` (a fieldTask on the Edit), so it is NOT modelled here.
 */
export interface Transition {
  from: EditStatus
  to: EditStatus
  capability: Capability
  /** Human label for the action that drives this transition. */
  label: string
}

export const TRANSITIONS: Transition[] = [
  { from: 'draft', to: 'pending_approval', capability: 'submit_for_approval', label: 'Submit for approval' },
  { from: 'pending_approval', to: 'approved', capability: 'approve_edit', label: 'Approve & publish' },
  { from: 'pending_approval', to: 'rejected', capability: 'approve_edit', label: 'Reject' },
  { from: 'rejected', to: 'draft', capability: 'edit_element', label: 'Reopen' },
]

/** Find the legal transition between two states, if any. */
export function findTransition(from: EditStatus, to: EditStatus): Transition | undefined {
  return TRANSITIONS.find((t) => t.from === from && t.to === to)
}

/** True if `role` may move an edit from `from` to `to`. */
export function canTransition(from: EditStatus, to: EditStatus, role: Role | undefined): boolean {
  const transition = findTransition(from, to)
  if (!transition) return false
  return can(role, transition.capability)
}

/** The transitions available to `role` from a given status (for building action buttons). */
export function availableTransitions(from: EditStatus, role: Role | undefined): Transition[] {
  return TRANSITIONS.filter((t) => t.from === from && can(role, t.capability))
}

/** Terminal states never change again. */
export function isTerminal(status: EditStatus): boolean {
  return status === 'approved'
}
