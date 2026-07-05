import { useAppDispatch } from '@/app/hooks'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { resetDemo } from '@/features/edits/editActions'
import { LayerToggle } from '@/features/network/LayerToggle'
import { RoleBadge } from '@/components/RoleBadge'
import { Button } from '@/components/Button'

export function TopBar() {
  const { user, logout } = useCurrentUser()
  const dispatch = useAppDispatch()
  if (!user) return null

  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-lg">💧</span>
        <span className="font-semibold text-slate-800">SMARTTERRA</span>
        <span className="hidden text-xs text-slate-400 md:inline">Water Network Review</span>
      </div>

      <div className="flex items-center gap-3">
        <LayerToggle />
        <div className="flex items-center gap-1.5">
          <span className="hidden text-sm text-slate-600 sm:inline">{user.name}</span>
          <RoleBadge role={user.role} />
        </div>
        <Button size="sm" variant="ghost" onClick={() => dispatch(resetDemo())} title="Restore seed data">
          Reset demo
        </Button>
        <Button size="sm" variant="secondary" onClick={logout}>
          Log out
        </Button>
      </div>
    </header>
  )
}
