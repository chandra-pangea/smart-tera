import { useMemo } from 'react'
import { useAppSelector } from '@/app/hooks'
import { applyOperations, listElements } from '@/lib/operations'
import { selectActiveEdit } from '@/features/edits/editsSelectors'

/**
 * The network to render. `published` is the approved default; `proposed` is the
 * published network with the active draft's operations applied (the overlay).
 * The layer toggle chooses which one `view` points at.
 */
export function useNetworkView() {
  const published = useAppSelector((s) => s.network)
  const activeLayer = useAppSelector((s) => s.ui.activeLayer)
  const activeEdit = useAppSelector(selectActiveEdit)

  const proposed = useMemo(
    () => (activeEdit ? applyOperations(published, activeEdit.operations) : published),
    [published, activeEdit],
  )

  const hasOverlay = !!activeEdit && activeEdit.operations.length > 0
  const view = activeLayer === 'proposed' ? proposed : published
  const elements = useMemo(() => listElements(view), [view])

  return { published, proposed, view, elements, activeLayer, hasOverlay }
}
