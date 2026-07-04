import { CircleMarker, Tooltip } from 'react-leaflet'
import type { LngLat, NodeElement } from '@/types/types'
import { describeElement } from '@/lib/elements'

const NODE_COLORS: Record<NodeElement['type'], string> = {
  junction: '#2563eb',
  valve: '#ea580c',
  reservoir: '#1e3a8a',
  tank: '#0d9488',
}

interface NodeMarkerProps {
  node: NodeElement
  selected: boolean
  pending: boolean
  onClick: (id: string, coord: LngLat) => void
}

export function NodeMarker({ node, selected, pending, onClick }: NodeMarkerProps) {
  const [lng, lat] = node.coordinates
  return (
    <CircleMarker
      center={[lat, lng]}
      radius={selected ? 9 : 7}
      pathOptions={{
        color: pending ? '#f59e0b' : selected ? '#111827' : '#1e293b',
        weight: pending || selected ? 3 : 1.5,
        fillColor: NODE_COLORS[node.type],
        fillOpacity: 0.9,
      }}
      eventHandlers={{
        click: (e) => {
          e.originalEvent.stopPropagation()
          onClick(node.id, node.coordinates)
        },
      }}
    >
      <Tooltip direction="top" offset={[0, -6]}>
        {describeElement(node)}
      </Tooltip>
    </CircleMarker>
  )
}
