import { Polyline, Tooltip } from 'react-leaflet'
import type { LngLat, Pipe } from '@/types/types'
import { describeElement } from '@/lib/elements'

interface PipeLineProps {
  pipe: Pipe
  selected: boolean
  onClick: (id: string, coord: LngLat) => void
}

export function PipeLine({ pipe, selected, onClick }: PipeLineProps) {
  const positions = pipe.coordinates.map(([lng, lat]) => [lat, lng] as [number, number])
  const color = selected ? '#2563eb' : pipe.status === 'closed' ? '#94a3b8' : '#0ea5e9'

  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color,
        weight: selected ? 6 : 4,
        opacity: 0.9,
        dashArray: pipe.status === 'closed' ? '6 6' : undefined,
      }}
      eventHandlers={{
        click: (e) => {
          e.originalEvent.stopPropagation()
          onClick(pipe.id, [e.latlng.lng, e.latlng.lat])
        },
      }}
    >
      <Tooltip>{describeElement(pipe)}</Tooltip>
    </Polyline>
  )
}
