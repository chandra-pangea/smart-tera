import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectCurrentUser } from '@/features/auth/authSelectors'
import { login as loginAction, logout as logoutAction } from '@/features/auth/authSlice'
import { resetUi } from '@/features/ui/uiSlice'

/** The logged-in user plus role flags and login/logout actions. */
export function useCurrentUser() {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectCurrentUser)
  const role = user?.role

  return {
    user,
    role,
    isAdmin: role === 'admin',
    isEditor: role === 'editor',
    isOperator: role === 'operator',
    login: (userId: string) => dispatch(loginAction(userId)),
    logout: () => {
      dispatch(logoutAction())
      dispatch(resetUi())
    },
  }
}
