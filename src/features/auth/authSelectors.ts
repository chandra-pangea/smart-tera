import type { RootState } from '@/app/store'
import { findUser } from '@/lib/seedUsers'

export const selectCurrentUser = (state: RootState) => findUser(state.auth.currentUserId)
export const selectRole = (state: RootState) => selectCurrentUser(state)?.role
