import { createSlice, current, type PayloadAction } from '@reduxjs/toolkit'
import type { ChangeOperation, Network } from '@/types/types'
import { applyOperations } from '@/lib/operations'
import { seedNetwork } from '@/lib/seedNetwork'

/**
 * The published (default) network — what every role sees. It is mutated in
 * exactly ONE place: `publishEdit`, dispatched when an Admin approves an edit.
 * Nothing else writes here, which is what keeps "approved edits become the
 * default" provable.
 */
const initialState: Network = seedNetwork()

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    /** Merge an approved edit's operations into the published network. */
    publishEdit(state, action: PayloadAction<ChangeOperation[]>) {
      // Reuse the one pure merge function on a plain snapshot, then replace.
      return applyOperations(current(state), action.payload)
    },
    /** Replace the whole network (import). */
    importNetwork(_state, action: PayloadAction<Network>) {
      return action.payload
    },
    /** Restore the seed network (demo reset). */
    resetNetwork() {
      return seedNetwork()
    },
  },
})

export const { publishEdit, importNetwork, resetNetwork } = networkSlice.actions
export const networkReducer = networkSlice.reducer
