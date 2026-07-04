import { useAppSelector } from '@/app/hooks'
import type { AuditEntry } from '@/types/types'

/** An edit's audit entries in chronological order (oldest first). */
export function useAuditTrail(editId: string): AuditEntry[] {
  return useAppSelector((s) => s.edits.byId[editId]?.audit ?? [])
}
