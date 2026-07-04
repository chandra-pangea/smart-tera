import type { ReactNode } from 'react'

interface FieldProps {
  label: string
  children: ReactNode
  hint?: string
}

/** A labelled form control. */
export function Field({ label, children, hint }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-0.5 block text-xs font-medium text-slate-500">{label}</span>
      {children}
      {hint && <span className="mt-0.5 block text-[11px] text-slate-400">{hint}</span>}
    </label>
  )
}
