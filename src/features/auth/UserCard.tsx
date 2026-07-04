import type { User } from '@/types/types'
import { RoleBadge } from '@/components/RoleBadge'

export function UserCard({ user, onSelect }: { user: User; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm transition-colors hover:border-blue-400 hover:shadow"
    >
      <div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-800">{user.name}</span>
          <RoleBadge role={user.role} />
        </div>
        <div className="text-xs text-slate-400">{user.email}</div>
      </div>
      <span className="text-sm font-medium text-blue-600">Sign in →</span>
    </button>
  )
}
