import type { User } from '@/types/types'

/**
 * Hardcoded users — at least one of each role. Logging in = selecting one of
 * these (no password). Two operators exist so "assign to an operator" is a
 * genuine choice. Credentials are documented in the README.
 */
export const SEED_USERS: User[] = [
  { id: 'u_admin', name: 'Ava Admin', email: 'admin@utility.test', role: 'admin' },
  { id: 'u_editor', name: 'Ed Editor', email: 'editor@utility.test', role: 'editor' },
  { id: 'u_op1', name: 'Ola Operator', email: 'op1@utility.test', role: 'operator' },
  { id: 'u_op2', name: 'Omar Operator', email: 'op2@utility.test', role: 'operator' },
]

export function findUser(userId: string | null): User | undefined {
  return SEED_USERS.find((u) => u.id === userId)
}

export function operators(): User[] {
  return SEED_USERS.filter((u) => u.role === 'operator')
}
