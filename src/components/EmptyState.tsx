import type { ReactNode } from 'react'

/** A friendly placeholder for empty lists / no-selection panels. */
export function EmptyState({ title, hint }: { title: string; hint?: ReactNode }) {
  return (
    <div className="px-3 py-8 text-center">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}
