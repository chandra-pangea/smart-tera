import type { ReactNode } from 'react'
import { TopBar } from './TopBar'

/**
 * The role-agnostic frame: a top bar, a scrollable left sidebar (role-specific
 * panels), and the map filling the rest. Map-first — the map is always the
 * largest surface.
 */
export function AppShell({ sidebar, map }: { sidebar: ReactNode; map: ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[384px] shrink-0 flex-col gap-3 overflow-y-auto border-r border-slate-200 bg-slate-100 p-3">
          {sidebar}
        </aside>
        <main className="relative min-w-0 flex-1">{map}</main>
      </div>
    </div>
  )
}
