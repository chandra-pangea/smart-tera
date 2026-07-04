/**
 * Shared domain types for the water-network review app.
 *
 * These describe the *model* only — no React, no Redux. Everything else
 * (slices, hooks, components) imports from here so the shapes stay consistent.
 */

// ---------------------------------------------------------------------------
// Users & roles
// ---------------------------------------------------------------------------

export type Role = 'admin' | 'editor' | 'operator'

export interface User {
  id: string
  name: string
  email: string
  role: Role
}

// ---------------------------------------------------------------------------
// Network elements
//
// A network is a graph: node-like elements (junction, valve, reservoir, tank)
// positioned by a single coordinate, and pipes that connect two nodes.
// Coordinates are always [lng, lat] (the spec's convention); we convert to
// Leaflet's [lat, lng] only at the map boundary.
// ---------------------------------------------------------------------------

export type ElementType = 'junction' | 'pipe' | 'valve' | 'reservoir' | 'tank'

/** A geographic position as [longitude, latitude]. */
export type LngLat = [number, number]

export type ValveType = 'PRV' | 'PSV' | 'PBV' | 'FCV' | 'TCV' | 'GPV'
export type ValveStatus = 'active' | 'open' | 'closed'
export type PipeStatus = 'open' | 'closed'

interface ElementBase {
  id: string
  type: ElementType
}

interface NodeBase extends ElementBase {
  coordinates: LngLat
}

export interface Junction extends NodeBase {
  type: 'junction'
  elevation: number
  demand: number
}

export interface Reservoir extends NodeBase {
  type: 'reservoir'
  head: number
}

export interface Tank extends NodeBase {
  type: 'tank'
  elevation: number
  initLevel: number
  minLevel: number
  maxLevel: number
  diameter: number
}

export interface Valve extends NodeBase {
  type: 'valve'
  valveType: ValveType
  diameter: number
  setting: number
  status: ValveStatus
}

/** Any element positioned by a single coordinate. */
export type NodeElement = Junction | Reservoir | Tank | Valve

export interface Pipe extends ElementBase {
  type: 'pipe'
  start: string // node id
  end: string // node id
  length: number
  diameter: number
  roughness: number
  status: PipeStatus
  /** Rendered polyline endpoints [startCoord, endCoord] in [lng, lat]. */
  coordinates: [LngLat, LngLat]
}

export type NetworkElement = NodeElement | Pipe

/** Normalized graph store: every element keyed by id. */
export interface Network {
  elements: Record<string, NetworkElement>
}

// ---------------------------------------------------------------------------
// Edits & the review/approval workflow
//
// An Edit is a proposed change set plus its whole history. Field verification
// is a SUB-STATE of draft (a fieldTask on the Edit) — not a lifecycle state.
// ---------------------------------------------------------------------------

export type EditStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected'

/** A partial bag of element properties, used by update operations. */
export type PropertyPatch = Record<string, unknown>

/**
 * The atomic change operations an Edit can carry. A pipe split is expressed
 * as several primitives (remove original + add junction + add two segments),
 * so merge/diff/undo all work uniformly.
 */
export type ChangeOperation =
  | { kind: 'add'; element: NetworkElement }
  | { kind: 'update'; elementId: string; before: PropertyPatch; after: PropertyPatch }
  | { kind: 'remove'; elementId: string; snapshot: NetworkElement }

export type FieldCondition = 'good' | 'needs_attention' | 'faulty'

export interface FieldTask {
  assignedTo: string // operator user id
  targetElementId?: string
  instruction: string
  assignedBy: string
  assignedAt: string
}

export interface FieldSubmission {
  observedValue: string
  condition: FieldCondition
  notes: string
  photoDataUrl?: string
  submittedBy: string
  submittedAt: string
}

export interface ThreadPost {
  id: string
  authorId: string
  role: Role
  body: string
  createdAt: string
}

export type AuditAction =
  | 'created'
  | 'element_added'
  | 'element_updated'
  | 'element_removed'
  | 'assigned'
  | 'field_submitted'
  | 'submitted_for_approval'
  | 'approved'
  | 'rejected'
  | 'reopened'
  | 'commented'

export interface AuditEntry {
  id: string
  actorId: string
  action: AuditAction
  at: string // ISO timestamp
  details?: string
}

export interface Edit {
  id: string
  title: string
  status: EditStatus
  authorId: string
  operations: ChangeOperation[]
  fieldTask?: FieldTask
  fieldSubmission?: FieldSubmission
  thread: ThreadPost[]
  audit: AuditEntry[]
  rejectionReason?: string
  createdAt: string
  updatedAt: string
}
