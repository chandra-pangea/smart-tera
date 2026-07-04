import type { ReactNode } from 'react'

interface ModalProps {
  title: string
  children: ReactNode
  onClose: () => void
}

/** A simple centered modal. Sits above the Leaflet map (z-index 2000). */
export function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-lg leading-none text-slate-400 hover:text-slate-600"
          >
            ×
          </button>
        </header>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
