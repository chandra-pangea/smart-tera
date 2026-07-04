import clsx from 'clsx'
import type { ReactNode } from 'react'

interface Tab<T extends string> {
  id: T
  label: ReactNode
}

interface TabsProps<T extends string> {
  tabs: Tab<T>[]
  active: T
  onChange: (id: T) => void
}

/** Segmented control for switching between panel views. */
export function Tabs<T extends string>({ tabs, active, onChange }: TabsProps<T>) {
  return (
    <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={clsx(
            'flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors',
            active === tab.id ? 'bg-white text-slate-800 shadow' : 'text-slate-500 hover:text-slate-700',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
