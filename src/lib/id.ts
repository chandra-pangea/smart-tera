import { nanoid } from 'nanoid'

/** Generate a short, prefixed, collision-resistant id (e.g. "J_a1b2c3d4"). */
export function newId(prefix: string): string {
  return `${prefix}_${nanoid(8)}`
}
