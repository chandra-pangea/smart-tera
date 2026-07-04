import type { ChangeOperation, Junction, LngLat, Pipe } from '@/types/types'
import { projectPointOnSegment, round2 } from './geo'
import { newId } from './id'

/**
 * Inserting a junction onto an existing pipe splits it: the original pipe
 * becomes two pipes meeting at the new junction, each still connected to one
 * original endpoint. Both segments keep the original pipe's properties
 * (diameter, roughness, status), and their lengths reflect the split point.
 *
 * Returned as operations (remove original + add junction + add two segments)
 * so the split lands in the Edit like any other change.
 */
export function buildSplitPipeOperations(
  pipe: Pipe,
  clickedCoord: LngLat,
): { operations: ChangeOperation[]; junction: Junction } {
  const [startCoord, endCoord] = pipe.coordinates
  const { point: splitCoord, t } = projectPointOnSegment(clickedCoord, startCoord, endCoord)

  const junction: Junction = {
    id: newId('J'),
    type: 'junction',
    coordinates: splitCoord,
    // Auto-elevation: linear interpolation is not possible without endpoint
    // elevations here, so we default to 0 and let the editor adjust.
    // (See docs/ASSUMPTIONS.md.)
    elevation: 0,
    demand: 0,
  }

  // Lengths reflect the split point: fraction `t` of the original length.
  const lengthA = round2(pipe.length * t)
  const lengthB = round2(pipe.length - lengthA)

  const segmentA: Pipe = {
    ...pipe,
    id: newId('P'),
    start: pipe.start,
    end: junction.id,
    length: lengthA,
    coordinates: [startCoord, splitCoord],
  }

  const segmentB: Pipe = {
    ...pipe,
    id: newId('P'),
    start: junction.id,
    end: pipe.end,
    length: lengthB,
    coordinates: [splitCoord, endCoord],
  }

  const operations: ChangeOperation[] = [
    { kind: 'remove', elementId: pipe.id, snapshot: pipe },
    { kind: 'add', element: junction },
    { kind: 'add', element: segmentA },
    { kind: 'add', element: segmentB },
  ]

  return { operations, junction }
}
