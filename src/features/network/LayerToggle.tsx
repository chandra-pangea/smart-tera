import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { setActiveLayer, type NetworkLayer } from '@/features/ui/uiSlice'
import { Tabs } from '@/components/Tabs'

/** Toggle the map between the published network and the proposed (draft) overlay. */
export function LayerToggle() {
  const dispatch = useAppDispatch()
  const layer = useAppSelector((s) => s.ui.activeLayer)

  return (
    <Tabs<NetworkLayer>
      tabs={[
        { id: 'published', label: 'Published' },
        { id: 'proposed', label: 'Proposed' },
      ]}
      active={layer}
      onChange={(id) => dispatch(setActiveLayer(id))}
    />
  )
}
