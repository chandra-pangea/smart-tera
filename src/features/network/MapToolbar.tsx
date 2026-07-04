import clsx from 'clsx'
import { useMapTool } from '@/hooks/useMapTool'
import type { MapTool } from '@/features/ui/uiSlice'
import { Panel } from '@/components/Panel'

const TOOLS: { id: MapTool; label: string; icon: string }[] = [
  { id: 'select', label: 'Select', icon: '⤢' },
  { id: 'add-junction', label: 'Junction', icon: '●' },
  { id: 'add-pipe', label: 'Pipe', icon: '╱' },
  { id: 'add-valve', label: 'Valve', icon: '◆' },
  { id: 'add-reservoir', label: 'Reservoir', icon: '▣' },
  { id: 'add-tank', label: 'Tank', icon: '⬢' },
  { id: 'delete', label: 'Delete', icon: '🗑' },
]

export function MapToolbar() {
  const { activeTool, setTool } = useMapTool()

  return (
    <Panel title="Tools">
      <div className="grid grid-cols-3 gap-1.5">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setTool(tool.id)}
            className={clsx(
              'flex flex-col items-center gap-0.5 rounded border px-1 py-1.5 text-[11px] font-medium transition-colors',
              activeTool === tool.id
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
            )}
          >
            <span className="text-base leading-none">{tool.icon}</span>
            {tool.label}
          </button>
        ))}
      </div>
    </Panel>
  )
}
