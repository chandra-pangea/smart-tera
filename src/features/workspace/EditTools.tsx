import { useSelectedElement } from '@/hooks/useSelectedElement'
import { MapToolbar } from '@/features/network/MapToolbar'
import { PropertyInspector } from '@/features/edits/PropertyInspector'
import { ActiveEditPanel } from '@/features/edits/ActiveEditPanel'
import { Panel } from '@/components/Panel'
import { EmptyState } from '@/components/EmptyState'

/** The editing surface shared by Editor and Admin: tools, inspector, draft. */
export function EditTools() {
  const { element } = useSelectedElement()

  return (
    <>
      <MapToolbar />
      {element ? (
        <PropertyInspector element={element} />
      ) : (
        <Panel title="Selection">
          <EmptyState
            title="Nothing selected"
            hint="Use the Select tool and click an element on the map."
          />
        </Panel>
      )}
      <ActiveEditPanel />
    </>
  )
}
