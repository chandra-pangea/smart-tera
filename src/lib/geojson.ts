import type {
  LngLat,
  Network,
  NetworkElement,
  Pipe,
  ValveStatus,
  ValveType,
} from '@/types/types'
import { isPipe, listElements } from './operations'

/**
 * Minimal GeoJSON typing — enough to load the seed FeatureCollection and to
 * import/export the network. Point features carry node elements; LineString
 * features carry pipes. This matches the spec's section-7 shape.
 */
interface GeoFeature {
  type: 'Feature'
  properties: Record<string, unknown>
  geometry:
    | { type: 'Point'; coordinates: LngLat }
    | { type: 'LineString'; coordinates: LngLat[] }
}

export interface FeatureCollection {
  type: 'FeatureCollection'
  features: GeoFeature[]
}

const num = (v: unknown, fallback = 0): number =>
  typeof v === 'number' ? v : Number(v ?? fallback) || fallback

const str = (v: unknown, fallback = ''): string => (v == null ? fallback : String(v))

// ---------------------------------------------------------------------------
// Parse: FeatureCollection -> normalized Network
// ---------------------------------------------------------------------------

function featureToElement(feature: GeoFeature): NetworkElement | null {
  const p = feature.properties ?? {}
  const type = str(p.type)
  const id = str(p.id)
  if (!id) return null

  if (feature.geometry.type === 'Point') {
    const coordinates = feature.geometry.coordinates
    switch (type) {
      case 'junction':
        return { id, type, coordinates, elevation: num(p.elevation), demand: num(p.demand) }
      case 'reservoir':
        return { id, type, coordinates, head: num(p.head) }
      case 'tank':
        return {
          id,
          type,
          coordinates,
          elevation: num(p.elevation),
          initLevel: num(p.initLevel),
          minLevel: num(p.minLevel),
          maxLevel: num(p.maxLevel),
          diameter: num(p.diameter),
        }
      case 'valve':
        return {
          id,
          type,
          coordinates,
          valveType: (str(p.valveType, 'PRV') as ValveType),
          diameter: num(p.diameter),
          setting: num(p.setting),
          status: (str(p.status, 'active') as ValveStatus),
        }
      default:
        return null
    }
  }

  if (feature.geometry.type === 'LineString' && type === 'pipe') {
    const coords = feature.geometry.coordinates
    const start = coords[0]
    const end = coords[coords.length - 1]
    return {
      id,
      type: 'pipe',
      start: str(p.start),
      end: str(p.end),
      length: num(p.length),
      diameter: num(p.diameter),
      roughness: num(p.roughness),
      status: (str(p.status, 'open') as Pipe['status']),
      coordinates: [start, end],
    }
  }

  return null
}

export function featureCollectionToNetwork(fc: FeatureCollection): Network {
  const elements: Record<string, NetworkElement> = {}
  for (const feature of fc.features) {
    const element = featureToElement(feature)
    if (element) elements[element.id] = element
  }
  return { elements }
}

// ---------------------------------------------------------------------------
// Serialize: Network -> FeatureCollection (for export)
// ---------------------------------------------------------------------------

function elementToFeature(element: NetworkElement): GeoFeature {
  if (isPipe(element)) {
    const { coordinates, ...rest } = element
    return {
      type: 'Feature',
      properties: { ...rest },
      geometry: { type: 'LineString', coordinates: [coordinates[0], coordinates[1]] },
    }
  }
  const { coordinates, ...rest } = element
  return {
    type: 'Feature',
    properties: { ...rest },
    geometry: { type: 'Point', coordinates },
  }
}

export function networkToFeatureCollection(network: Network): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: listElements(network).map(elementToFeature),
  }
}
