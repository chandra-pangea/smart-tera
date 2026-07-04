import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

/**
 * Auth = which hardcoded user is currently logged in. Users themselves live in
 * `lib/seedUsers` (they're constants, no need to persist them); we only persist
 * the selected user id so a refresh keeps you in-role.
 */
export interface AuthState {
  currentUserId: string | null
}

const initialState: AuthState = {
  currentUserId: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action: PayloadAction<string>) {
      state.currentUserId = action.payload
    },
    logout(state) {
      state.currentUserId = null
    },
  },
})

export const { login, logout } = authSlice.actions
export const authReducer = authSlice.reducer
