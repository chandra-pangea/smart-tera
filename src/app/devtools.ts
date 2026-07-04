import { store } from './store'
import * as editActions from '@/features/edits/editActions'
import { login, logout } from '@/features/auth/authSlice'
import { selectElement, setActiveTool } from '@/features/ui/uiSlice'

/**
 * Dev-only: exposes the store and key actions on `window.__app` so the running
 * app can be driven/inspected from the console. Guarded by import.meta.env.DEV,
 * so it is stripped from production builds.
 */
export function installDevtools() {
  Object.assign(window as unknown as Record<string, unknown>, {
    __app: { store, editActions, login, logout, selectElement, setActiveTool },
  })
}
