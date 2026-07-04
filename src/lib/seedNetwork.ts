import type { Network } from '@/types/types'
import { featureCollectionToNetwork, type FeatureCollection } from './geojson'

/**
 * Starting network — the spec's section-7 FeatureCollection. Small and
 * deterministic so the demo is repeatable. Coordinates are [lng, lat].
 */
export const SEED_FEATURE_COLLECTION: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { id: 'R1', type: 'reservoir', head: 250 },
      geometry: { type: 'Point', coordinates: [77.593, 12.97] },
    },
    {
      type: 'Feature',
      properties: { id: 'J1', type: 'junction', elevation: 210, demand: 5 },
      geometry: { type: 'Point', coordinates: [77.5946, 12.9716] },
    },
    {
      type: 'Feature',
      properties: { id: 'J2', type: 'junction', elevation: 208, demand: 8 },
      geometry: { type: 'Point', coordinates: [77.5966, 12.9726] },
    },
    {
      type: 'Feature',
      properties: { id: 'J3', type: 'junction', elevation: 205, demand: 3 },
      geometry: { type: 'Point', coordinates: [77.5986, 12.9736] },
    },
    {
      type: 'Feature',
      properties: {
        id: 'V1',
        type: 'valve',
        valveType: 'PRV',
        diameter: 250,
        setting: 40,
        status: 'active',
      },
      geometry: { type: 'Point', coordinates: [77.5976, 12.9731] },
    },
    {
      type: 'Feature',
      properties: {
        id: 'P1',
        type: 'pipe',
        start: 'R1',
        end: 'J1',
        length: 500,
        diameter: 300,
        roughness: 130,
        status: 'open',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [77.593, 12.97],
          [77.5946, 12.9716],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'P2',
        type: 'pipe',
        start: 'J1',
        end: 'J2',
        length: 350,
        diameter: 250,
        roughness: 130,
        status: 'open',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [77.5946, 12.9716],
          [77.5966, 12.9726],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 'P3',
        type: 'pipe',
        start: 'J2',
        end: 'J3',
        length: 300,
        diameter: 250,
        roughness: 130,
        status: 'open',
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [77.5966, 12.9726],
          [77.5986, 12.9736],
        ],
      },
    },
  ],
}

/** The seed network in normalized form. */
export function seedNetwork(): Network {
  return featureCollectionToNetwork(SEED_FEATURE_COLLECTION)
}

/** Map centre for the initial view [lat, lng] (Leaflet order). */
export const SEED_CENTER: [number, number] = [12.9718, 77.5958]
export const SEED_ZOOM = 15
