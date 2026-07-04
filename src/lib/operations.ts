import type {
  ChangeOperation,
  Network,
  NetworkElement,
  NodeElement,
  Pipe,
} from '@/types/types'

// ---------------------------------------------------------------------------
// Type guards & selectors
// ---------------------------------------------------------------------------

export function isPipe(el: NetworkElement): el is Pipe {
  return el.type === 'pipe'
}

export function isNode(el: NetworkElement): el is NodeElement {
  return el.type !== 'pipe'
}

export function listElements(network: Network): NetworkElement[] {
  return Object.values(network.elements)
}

export function getPipes(network: Network): Pipe[] {
  return listElements(network).filter(isPipe)
}

export function getNodes(network: Network): NodeElement[] {
  return listElements(network).filter(isNode)
}

/** Pipes attached to a given node id (as start or end). */
export function pipesAttachedTo(network: Network, nodeId: string): Pipe[] {
  return getPipes(network).filter((p) => p.start === nodeId || p.end === nodeId)
}

// ---------------------------------------------------------------------------
// The one pure merge function
//
// Used for (a) publishing an approved edit, (b) the proposed-layer overlay,
// and (c) the diff view. Always returns a NEW network; never mutates input.
// ---------------------------------------------------------------------------

export function applyOperations(network: Network, operations: ChangeOperation[]): Network {
  const elements: Record<string, NetworkElement> = { ...network.elements }

  for (const op of operations) {
    switch (op.kind) {
      case 'add':
        elements[op.element.id] = op.element
        break
      case 'update': {
        const existing = elements[op.elementId]
        if (existing) {
          // Merge the "after" patch onto the existing element.
          elements[op.elementId] = { ...existing, ...op.after } as NetworkElement
        }
        break
      }
      case 'remove':
        delete elements[op.elementId]
        break
    }
  }

  return { elements }
}

// ---------------------------------------------------------------------------
// Delete with cascade
//
// Deleting a node removes the pipes attached to it; deleting a pipe removes
// only the pipe. Expressed as operations so it lands in the Edit and is
// reviewable, diffable, and revertible.
// ---------------------------------------------------------------------------

export function buildRemoveOperations(network: Network, elementId: string): ChangeOperation[] {
  const target = network.elements[elementId]
  if (!target) return []

  if (isPipe(target)) {
    return [{ kind: 'remove', elementId, snapshot: target }]
  }

  const ops: ChangeOperation[] = pipesAttachedTo(network, elementId).map((pipe) => ({
    kind: 'remove' as const,
    elementId: pipe.id,
    snapshot: pipe,
  }))
  ops.push({ kind: 'remove', elementId, snapshot: target })
  return ops
}
