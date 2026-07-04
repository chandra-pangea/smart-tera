import type { LngLat } from '@/types/types'

const EARTH_RADIUS_M = 6_371_000

const toRadians = (deg: number): number => (deg * Math.PI) / 180

/** Great-circle distance in metres between two [lng, lat] points. */
export function haversineMeters(a: LngLat, b: LngLat): number {
  const [lng1, lat1] = a
  const [lng2, lat2] = b
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  const sinLat = Math.sin(dLat / 2)
  const sinLng = Math.sin(dLng / 2)
  const h =
    sinLat * sinLat +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * sinLng * sinLng
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)))
}

/**
 * Project point `p` onto segment `[a, b]` (planar lng/lat space — accurate
 * enough at city scale). Returns the closest point on the segment and `t`,
 * the clamped fractional position along it (0 at `a`, 1 at `b`).
 */
export function projectPointOnSegment(
  p: LngLat,
  a: LngLat,
  b: LngLat,
): { point: LngLat; t: number } {
  const [px, py] = p
  const [ax, ay] = a
  const [bx, by] = b
  const abx = bx - ax
  const aby = by - ay
  const lengthSq = abx * abx + aby * aby
  const raw = lengthSq === 0 ? 0 : ((px - ax) * abx + (py - ay) * aby) / lengthSq
  const t = Math.max(0, Math.min(1, raw))
  return { point: [ax + t * abx, ay + t * aby], t }
}

/** Round to 2 decimals — keeps derived lengths tidy. */
export function round2(n: number): number {
  return Math.round(n * 100) / 100
}
