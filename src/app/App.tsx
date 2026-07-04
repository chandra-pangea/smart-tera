import { useCurrentUser } from '@/hooks/useCurrentUser'
import { LoginScreen } from '@/features/auth/LoginScreen'
import { AppShell } from '@/layouts/AppShell'
import { NetworkMap } from '@/features/network/NetworkMap'
import { EditorWorkspace } from '@/features/workspace/EditorWorkspace'
import { OperatorWorkspace } from '@/features/workspace/OperatorWorkspace'
import { AdminWorkspace } from '@/features/workspace/AdminWorkspace'

/** Role decides the sidebar; the map is shared across all roles. */
export function App() {
  const { user, role } = useCurrentUser()
  if (!user) return <LoginScreen />

  const sidebar =
    role === 'admin' ? (
      <AdminWorkspace />
    ) : role === 'operator' ? (
      <OperatorWorkspace />
    ) : (
      <EditorWorkspace />
    )

  return <AppShell sidebar={sidebar} map={<NetworkMap />} />
}
