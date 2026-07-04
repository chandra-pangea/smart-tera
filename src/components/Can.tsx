import type { ReactNode } from 'react'
import type { Capability } from '@/lib/permissions'
import { usePermissions } from '@/hooks/usePermissions'

/**
 * Renders `children` only if the current role has `capability`. Uses the same
 * `can()` matrix as the thunks — a UI gate, backed by the real logic guard.
 */
export function Can({
  capability,
  children,
  fallback = null,
}: {
  capability: Capability
  children: ReactNode
  fallback?: ReactNode
}) {
  const { can } = usePermissions()
  return <>{can(capability) ? children : fallback}</>
}
