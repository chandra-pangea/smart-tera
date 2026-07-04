import clsx from 'clsx'
import type { ReactNode } from 'react'

interface PanelProps {
  title?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}

/** A titled card. Header stays put; body is where content goes. */
export function Panel({ title, actions, children, className, bodyClassName }: PanelProps) {
  return (
    <section
      className={clsx(
        // shrink-0 so panels keep their natural height and the sidebar scrolls,
        // instead of each panel shrinking and clipping its own content.
        'flex shrink-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm',
        className,
      )}
    >
      {(title || actions) && (
        <header className="flex items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
          <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
          {actions}
        </header>
      )}
      <div className={clsx('p-3', bodyClassName)}>{children}</div>
    </section>
  )
}
