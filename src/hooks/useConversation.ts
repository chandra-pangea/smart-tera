import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { postComment } from '@/features/edits/editActions'

/** An edit's conversation thread + the guarded action to post to it. */
export function useConversation(editId: string) {
  const dispatch = useAppDispatch()
  const thread = useAppSelector((s) => s.edits.byId[editId]?.thread ?? [])

  return {
    thread,
    post: (body: string) => dispatch(postComment(editId, body)),
  }
}
