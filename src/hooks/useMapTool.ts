import { useAppDispatch, useAppSelector } from '@/app/hooks'
import type { LngLat } from '@/types/types'
import { createJunction, createPipe, NODE_FACTORIES } from '@/lib/elements'
import { isPipe } from '@/lib/operations'
import { setActiveTool, setPendingPipeStart, selectElement, type MapTool } from '@/features/ui/uiSlice'
import { addElement, removeElement, splitPipeAt } from '@/features/edits/editActions'
import { useNetworkView } from './useNetworkView'

/**
 * The map interaction state machine. Components hand it raw clicks (on empty
 * map, or on an element); it dispatches the right edit action for the active
 * tool. All the "what does clicking mean right now" logic lives here so the map
 * component stays declarative.
 */
export function useMapTool() {
  const dispatch = useAppDispatch()
  const activeTool = useAppSelector((s) => s.ui.activeTool)
  const pendingPipeStartId = useAppSelector((s) => s.ui.pendingPipeStartId)
  const { view } = useNetworkView()

  const setTool = (tool: MapTool) => dispatch(setActiveTool(tool))

  /** Connect the pending start node to `endNodeId` as a new pipe. */
  const connectPipe = (endNodeId: string, endCoord: LngLat) => {
    if (!pendingPipeStartId || pendingPipeStartId === endNodeId) {
      dispatch(setPendingPipeStart(endNodeId))
      return
    }
    const startNode = view.elements[pendingPipeStartId]
    if (!startNode || isPipe(startNode)) {
      dispatch(setPendingPipeStart(endNodeId))
      return
    }
    dispatch(addElement(createPipe(pendingPipeStartId, endNodeId, startNode.coordinates, endCoord)))
    dispatch(setPendingPipeStart(null))
  }

  /** A click on empty map at `coord`. */
  const handleMapClick = (coord: LngLat) => {
    switch (activeTool) {
      case 'add-junction':
      case 'add-valve':
      case 'add-reservoir':
      case 'add-tank': {
        const factory = NODE_FACTORIES[activeTool.replace('add-', '') as keyof typeof NODE_FACTORIES]
        dispatch(addElement(factory(coord)))
        break
      }
      case 'add-pipe': {
        // epanet-js style: an empty click auto-creates a junction endpoint.
        const junction = createJunction(coord)
        dispatch(addElement(junction))
        connectPipe(junction.id, junction.coordinates)
        break
      }
      default:
        dispatch(selectElement(null))
    }
  }

  /** A click on an existing element `elementId` (at `coord` on the map). */
  const handleElementClick = (elementId: string, coord: LngLat) => {
    const element = view.elements[elementId]
    if (!element) return

    switch (activeTool) {
      case 'select':
        dispatch(selectElement(elementId))
        break
      case 'delete':
        dispatch(removeElement(elementId))
        break
      case 'add-junction':
        // Dropping a junction onto a pipe splits it; onto a node just selects.
        if (isPipe(element)) dispatch(splitPipeAt(elementId, coord))
        else dispatch(selectElement(elementId))
        break
      case 'add-pipe':
        if (!isPipe(element)) connectPipe(elementId, element.coordinates)
        break
      default:
        dispatch(selectElement(elementId))
    }
  }

  return { activeTool, pendingPipeStartId, setTool, handleMapClick, handleElementClick }
}
