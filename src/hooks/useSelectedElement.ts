import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectElement } from '@/features/ui/uiSlice'
import { useNetworkView } from './useNetworkView'

/** The currently selected element (resolved from the visible network) + setter. */
export function useSelectedElement() {
  const dispatch = useAppDispatch()
  const selectedId = useAppSelector((s) => s.ui.selectedElementId)
  const { view } = useNetworkView()
  const element = selectedId ? view.elements[selectedId] : undefined

  return {
    selectedId,
    element,
    select: (id: string | null) => dispatch(selectElement(id)),
  }
}
