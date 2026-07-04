import { useMemo } from 'react'
import { useAppSelector } from '@/app/hooks'
import type { Edit } from '@/types/types'
import { computeDiff, type ElementDiff } from '@/lib/diff'

/** Property-level diff of an edit's proposed changes vs the published network. */
export function useDiff(edit?: Edit): ElementDiff[] {
  const published = useAppSelector((s) => s.network)
  return useMemo(() => (edit ? computeDiff(edit.operations, published) : []), [edit, published])
}
