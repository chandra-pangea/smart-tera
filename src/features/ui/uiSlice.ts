import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

/** Map interaction tools. `add-pipe` is two-click (start node, then end node). */
export type MapTool =
  | 'select'
  | 'add-junction'
  | 'add-valve'
  | 'add-reservoir'
  | 'add-tank'
  | 'add-pipe'
  | 'delete'

export type NetworkLayer = 'published' | 'proposed'

/**
 * Transient view state — selection, active tool, layer toggle, in-progress
 * pipe drawing. Deliberately NOT persisted: a refresh shouldn't restore a
 * half-drawn pipe or a stale selection.
 */
export interface UiState {
  selectedElementId: string | null
  activeTool: MapTool
  activeLayer: NetworkLayer
  /** First endpoint chosen while drawing a pipe, or null. */
  pendingPipeStartId: string | null
}

const initialState: UiState = {
  selectedElementId: null,
  activeTool: 'select',
  activeLayer: 'proposed',
  pendingPipeStartId: null,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    selectElement(state, action: PayloadAction<string | null>) {
      state.selectedElementId = action.payload
    },
    setActiveTool(state, action: PayloadAction<MapTool>) {
      state.activeTool = action.payload
      state.pendingPipeStartId = null // reset pipe drawing when switching tools
    },
    setActiveLayer(state, action: PayloadAction<NetworkLayer>) {
      state.activeLayer = action.payload
    },
    setPendingPipeStart(state, action: PayloadAction<string | null>) {
      state.pendingPipeStartId = action.payload
    },
    resetUi() {
      return initialState
    },
  },
})

export const {
  selectElement,
  setActiveTool,
  setActiveLayer,
  setPendingPipeStart,
  resetUi,
} = uiSlice.actions
export const uiReducer = uiSlice.reducer
