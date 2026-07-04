import { useEffect, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

import type { LngLat } from '@/types/types'
import { isPipe } from '@/lib/operations'
import { SEED_CENTER, SEED_ZOOM } from '@/lib/seedNetwork'
import { useNetworkView } from '@/hooks/useNetworkView'
import { useMapTool } from '@/hooks/useMapTool'
import { useSelectedElement } from '@/hooks/useSelectedElement'
import { NodeMarker } from './markers/NodeMarker'
import { PipeLine } from './markers/PipeLine'

const TOOL_HINTS: Record<string, string> = {
  select: 'Click an element to select and edit it',
  'add-junction': 'Click the map to add a junction — click a pipe to split it',
  'add-valve': 'Click the map to place a valve',
  'add-reservoir': 'Click the map to place a reservoir',
  'add-tank': 'Click the map to place a tank',
  delete: 'Click an element to delete it (attached pipes cascade)',
}

/** Fires a callback on empty-map clicks (unless a layer click just handled it). */
function MapClickCatcher({ onMapClick }: { onMapClick: (coord: LngLat) => void }) {
  useMapEvents({
    click(e) {
      onMapClick([e.latlng.lng, e.latlng.lat])
    },
  })
  return null
}

/** Pans the map to the selected element — the "map-first" highlight. */
function RecenterOnSelection({ target }: { target?: LngLat }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.panTo([target[1], target[0]])
  }, [target, map])
  return null
}

export function NetworkMap() {
  const { elements } = useNetworkView()
  const { handleMapClick, handleElementClick, activeTool, pendingPipeStartId } = useMapTool()
  const { selectedId, element: selectedElement } = useSelectedElement()

  // A layer click and a map click can both fire; suppress the map click that
  // immediately follows an element click.
  const suppressMapClick = useRef(false)
  const onElementClick = (id: string, coord: LngLat) => {
    suppressMapClick.current = true
    handleElementClick(id, coord)
  }
  const onMapClick = (coord: LngLat) => {
    if (suppressMapClick.current) {
      suppressMapClick.current = false
      return
    }
    handleMapClick(coord)
  }

  const selectionTarget = useMemo<LngLat | undefined>(() => {
    if (!selectedElement) return undefined
    return isPipe(selectedElement) ? selectedElement.coordinates[0] : selectedElement.coordinates
  }, [selectedElement])

  const hint =
    activeTool === 'add-pipe'
      ? pendingPipeStartId
        ? 'Click the end node (or map) to finish the pipe'
        : 'Click the start node (or map) to begin a pipe'
      : TOOL_HINTS[activeTool]

  return (
    <div className="relative h-full w-full">
      <MapContainer center={SEED_CENTER} zoom={SEED_ZOOM} className="h-full w-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <MapClickCatcher onMapClick={onMapClick} />
        <RecenterOnSelection target={selectionTarget} />

        {elements.map((el) =>
          isPipe(el) ? (
            <PipeLine key={el.id} pipe={el} selected={el.id === selectedId} onClick={onElementClick} />
          ) : (
            <NodeMarker
              key={el.id}
              node={el}
              selected={el.id === selectedId}
              pending={el.id === pendingPipeStartId}
              onClick={onElementClick}
            />
          ),
        )}
      </MapContainer>

      {hint && (
        <div className="pointer-events-none absolute left-1/2 top-3 z-[1000] -translate-x-1/2 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-medium text-white shadow">
          {hint}
        </div>
      )}
    </div>
  )
}
