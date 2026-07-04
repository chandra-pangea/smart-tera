import { combineReducers, configureStore } from '@reduxjs/toolkit'
import type { ThunkAction, UnknownAction } from '@reduxjs/toolkit'
import {
  persistReducer,
  persistStore,
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'

import { authReducer } from '@/features/auth/authSlice'
import { networkReducer } from '@/features/network/networkSlice'
import { editsReducer } from '@/features/edits/editsSlice'
import { uiReducer } from '@/features/ui/uiSlice'

const rootReducer = combineReducers({
  auth: authReducer,
  network: networkReducer,
  edits: editsReducer,
  ui: uiReducer,
})

const persistConfig = {
  key: 'smart-tera',
  version: 1,
  storage,
  // `ui` is transient (selection, active tool, layer) — deliberately not persisted.
  whitelist: ['auth', 'network', 'edits'],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof rootReducer>
export type AppStore = typeof store
export type AppDispatch = typeof store.dispatch
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  UnknownAction
>
