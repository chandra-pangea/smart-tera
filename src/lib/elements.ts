import type {
  ElementType,
  Junction,
  LngLat,
  NetworkElement,
  Pipe,
  Reservoir,
  Tank,
  Valve,
  ValveType,
} from '@/types/types'
import { newId } from './id'
import { haversineMeters, round2 } from './geo'

export const ELEMENT_TYPE_LABEL: Record<ElementType, string> = {
  junction: 'Junction',
  pipe: 'Pipe',
  valve: 'Valve',
  reservoir: 'Reservoir',
  tank: 'Tank',
}

/** Short human label for an element, e.g. "Pipe P1". */
export function describeElement(el: NetworkElement): string {
  return `${ELEMENT_TYPE_LABEL[el.type]} ${el.id}`
}

// ---------------------------------------------------------------------------
// Editable-property schema — drives the PropertyInspector generically so it
// never hard-codes per-type form fields.
// ---------------------------------------------------------------------------

export interface PropertyField {
  key: string
  label: string
  kind: 'number' | 'select' | 'readonly'
  options?: readonly string[]
}

const VALVE_TYPES: readonly ValveType[] = ['PRV', 'PSV', 'PBV', 'FCV', 'TCV', 'GPV']

export const PROPERTY_FIELDS: Record<ElementType, PropertyField[]> = {
  junction: [
    { key: 'elevation', label: 'Elevation', kind: 'number' },
    { key: 'demand', label: 'Demand', kind: 'number' },
  ],
  reservoir: [{ key: 'head', label: 'Head', kind: 'number' }],
  tank: [
    { key: 'elevation', label: 'Elevation', kind: 'number' },
    { key: 'initLevel', label: 'Initial level', kind: 'number' },
    { key: 'minLevel', label: 'Min level', kind: 'number' },
    { key: 'maxLevel', label: 'Max level', kind: 'number' },
    { key: 'diameter', label: 'Diameter', kind: 'number' },
  ],
  valve: [
    { key: 'valveType', label: 'Valve type', kind: 'select', options: VALVE_TYPES },
    { key: 'diameter', label: 'Diameter', kind: 'number' },
    { key: 'setting', label: 'Setting', kind: 'number' },
    { key: 'status', label: 'Status', kind: 'select', options: ['active', 'open', 'closed'] },
  ],
  pipe: [
    { key: 'start', label: 'Start node', kind: 'readonly' },
    { key: 'end', label: 'End node', kind: 'readonly' },
    { key: 'length', label: 'Length', kind: 'number' },
    { key: 'diameter', label: 'Diameter', kind: 'number' },
    { key: 'roughness', label: 'Roughness', kind: 'number' },
    { key: 'status', label: 'Status', kind: 'select', options: ['open', 'closed'] },
  ],
}

// ---------------------------------------------------------------------------
// Factories — new elements with sensible, immediately-editable defaults.
// ---------------------------------------------------------------------------

export function createJunction(coordinates: LngLat): Junction {
  return { id: newId('J'), type: 'junction', coordinates, elevation: 0, demand: 0 }
}

export function createReservoir(coordinates: LngLat): Reservoir {
  return { id: newId('R'), type: 'reservoir', coordinates, head: 100 }
}

export function createTank(coordinates: LngLat): Tank {
  return {
    id: newId('T'),
    type: 'tank',
    coordinates,
    elevation: 0,
    initLevel: 5,
    minLevel: 0,
    maxLevel: 10,
    diameter: 20,
  }
}

export function createValve(coordinates: LngLat): Valve {
  return {
    id: newId('V'),
    type: 'valve',
    coordinates,
    valveType: 'PRV',
    diameter: 200,
    setting: 0,
    status: 'active',
  }
}

export function createPipe(startId: string, endId: string, startCoord: LngLat, endCoord: LngLat): Pipe {
  return {
    id: newId('P'),
    type: 'pipe',
    start: startId,
    end: endId,
    length: round2(haversineMeters(startCoord, endCoord)),
    diameter: 200,
    roughness: 130,
    status: 'open',
    coordinates: [startCoord, endCoord],
  }
}

/** The node-adding tools and the factory each uses. */
export const NODE_FACTORIES: Record<'junction' | 'valve' | 'reservoir' | 'tank', (c: LngLat) => NetworkElement> = {
  junction: createJunction,
  valve: createValve,
  reservoir: createReservoir,
  tank: createTank,
}
