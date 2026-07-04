import type { ElementDiff } from '@/lib/diff'
import { Badge } from '@/components/Badge'
import { EmptyState } from '@/components/EmptyState'

const KIND_STYLE: Record<ElementDiff['kind'], string> = {
  added: 'bg-green-100 text-green-700',
  removed: 'bg-red-100 text-red-700',
  updated: 'bg-amber-100 text-amber-700',
}

/** Renders a proposed change as an element-by-element, property-level diff. */
export function DiffView({ diffs }: { diffs: ElementDiff[] }) {
  if (diffs.length === 0) {
    return <EmptyState title="No changes yet" hint="Edit or add elements to see the proposed diff." />
  }

  return (
    <ul className="space-y-2">
      {diffs.map((diff, index) => (
        <li key={`${diff.elementId}-${index}`} className="rounded border border-slate-200 p-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">{diff.label}</span>
            <Badge className={KIND_STYLE[diff.kind]}>{diff.kind}</Badge>
          </div>
          {diff.kind === 'updated' && (
            <table className="mt-1 w-full text-xs">
              <tbody>
                {diff.fieldChanges.map((change) => (
                  <tr key={change.key}>
                    <td className="py-0.5 pr-2 text-slate-400">{change.key}</td>
                    <td className="py-0.5 text-slate-400 line-through">{String(change.before)}</td>
                    <td className="px-1 text-slate-300">→</td>
                    <td className="py-0.5 font-medium text-slate-700">{String(change.after)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </li>
      ))}
    </ul>
  )
}
