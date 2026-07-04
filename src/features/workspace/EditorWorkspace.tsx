import { EditTools } from './EditTools'
import { EditorHistoryPanel } from '@/features/edits/EditorHistoryPanel'

/** Editor sidebar: editing tools + the editor's submitted-edit history. */
export function EditorWorkspace() {
  return (
    <>
      <EditTools />
      <EditorHistoryPanel />
    </>
  )
}
