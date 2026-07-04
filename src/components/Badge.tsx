import clsx from 'clsx'
import type { ReactNode } from 'react'

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium',
        className,
      )}
    >
      {children}
    </span>
  )
}
