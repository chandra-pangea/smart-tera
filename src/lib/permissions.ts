import type { Role } from '@/types/types'

/**
 * The set of gated actions in the app. This is the single vocabulary used by
 * BOTH the UI gates (<Can>) and the mutating thunks, so permission can never
 * be bypassed by simply un-hiding a button.
 */
export type Capability =
  | 'view' // see the map & network
  | 'edit_element' // modify an element's properties
  | 'add_element' // add a junction/pipe/valve/reservoir/tank
  | 'remove_element' // delete an element
  | 'assign_field_task' // dispatch a field task to an operator
  | 'submit_field_form' // fill & submit the operator field form
  | 'submit_for_approval' // move an edit into pending approval
  | 'approve_edit' // approve or reject a pending edit
  | 'publish' // publish an approved edit as the default (folded into approve)
  | 'post_comment' // post to an edit's conversation thread

/**
 * Capability matrix. Admin is a deliberate SUPERSET of Editor (can edit *and*
 * approve) — see docs/ASSUMPTIONS.md "Admin can edit". Operator can only view,
 * fill the field form, and comment.
 */
const CAPABILITIES_BY_ROLE: Record<Role, Capability[]> = {
  admin: [
    'view',
    'edit_element',
    'add_element',
    'remove_element',
    'assign_field_task',
    'submit_for_approval',
    'approve_edit',
    'publish',
    'post_comment',
  ],
  editor: [
    'view',
    'edit_element',
    'add_element',
    'remove_element',
    'assign_field_task',
    'submit_for_approval',
    'post_comment',
  ],
  operator: ['view', 'submit_field_form', 'post_comment'],
}

/** True if `role` is allowed to perform `capability`. Undefined role = denied. */
export function can(role: Role | undefined, capability: Capability): boolean {
  if (!role) return false
  return CAPABILITIES_BY_ROLE[role].includes(capability)
}

/** All capabilities a role has — handy for debugging / the role legend. */
export function capabilitiesOf(role: Role): Capability[] {
  return CAPABILITIES_BY_ROLE[role]
}
