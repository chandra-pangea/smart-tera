import { SEED_USERS } from '@/lib/seedUsers'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { UserCard } from './UserCard'

export function LoginScreen() {
  const { login } = useCurrentUser()

  return (
    <div className="flex h-full items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-lg">
        <div className="mb-6 text-center">
          <div className="text-4xl">💧</div>
          <h1 className="mt-2 text-xl font-semibold text-slate-800">Smart Tera</h1>
          <p className="text-sm text-slate-500">
            Water Network Review — choose a user to sign in (no password)
          </p>
        </div>

        <div className="space-y-2">
          {SEED_USERS.map((user) => (
            <UserCard key={user.id} user={user} onSelect={() => login(user.id)} />
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Roles are enforced in logic — each user can do exactly what their role allows.
        </p>
      </div>
    </div>
  )
}
