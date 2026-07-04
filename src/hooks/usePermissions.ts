import { useAppSelector } from '@/app/hooks'
import { selectRole } from '@/features/auth/authSelectors'
import { can as canFn, type Capability } from '@/lib/permissions'

/**
 * Permission check bound to the current role. Uses the SAME `can()` matrix as
 * the thunks, so the UI and the logic can never disagree.
 */
export function usePermissions() {
  const role = useAppSelector(selectRole)
  return {
    role,
    can: (capability: Capability) => canFn(role, capability),
  }
}
