import type { ChangeOperation, Network, NetworkElement } from '@/types/types'
import { describeElement, ELEMENT_TYPE_LABEL } from './elements'

export interface FieldChange {
  key: string
  before: unknown
  after: unknown
}

export interface ElementDiff {
  elementId: string
  label: string
  kind: 'added' | 'removed' | 'updated'
  fieldChanges: FieldChange[]
  /** Snapshot for added/removed (for map highlight + context). */
  element?: NetworkElement
}

/**
 * Turn an Edit's operations into a readable, element-by-element diff of the
 * proposed change against the current published network. Pure — the DiffView
 * just renders the result.
 */
export function computeDiff(operations: ChangeOperation[], published: Network): ElementDiff[] {
  return operations.map((op): ElementDiff => {
    switch (op.kind) {
      case 'add':
        return {
          elementId: op.element.id,
          label: describeElement(op.element),
          kind: 'added',
          fieldChanges: [],
          element: op.element,
        }
      case 'remove':
        return {
          elementId: op.elementId,
          label: describeElement(op.snapshot),
          kind: 'removed',
          fieldChanges: [],
          element: op.snapshot,
        }
      case 'update': {
        const current = published.elements[op.elementId]
        const label = current
          ? describeElement(current)
          : `${ELEMENT_TYPE_LABEL[(op.after.type as NetworkElement['type']) ?? 'junction'] ?? 'Element'} ${op.elementId}`
        const fieldChanges: FieldChange[] = Object.keys(op.after).map((key) => ({
          key,
          before: op.before[key],
          after: op.after[key],
        }))
        return { elementId: op.elementId, label, kind: 'updated', fieldChanges, element: current }
      }
    }
  })
}
