import { useState } from 'react'
import { useConversation } from '@/hooks/useConversation'
import { usePermissions } from '@/hooks/usePermissions'
import { findUser } from '@/lib/seedUsers'
import { formatTimestamp } from '@/lib/formatDate'
import { RoleBadge } from '@/components/RoleBadge'
import { Button } from '@/components/Button'
import { controlClass } from '@/components/controls'

/** An edit's threaded conversation — any role that can see it can post. */
export function ConversationThread({ editId }: { editId: string }) {
  const { thread, post } = useConversation(editId)
  const { can } = usePermissions()
  const [body, setBody] = useState('')

  const submit = () => {
    if (!body.trim()) return
    post(body)
    setBody('')
  }

  return (
    <div className="space-y-2">
      {thread.length === 0 ? (
        <p className="text-xs text-slate-400">No messages yet.</p>
      ) : (
        <ul className="space-y-2">
          {thread.map((entry) => (
            <li key={entry.id} className="rounded bg-slate-50 p-2">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-medium text-slate-700">
                  {findUser(entry.authorId)?.name ?? entry.authorId}
                </span>
                <RoleBadge role={entry.role} />
                <span className="text-slate-400">{formatTimestamp(entry.createdAt)}</span>
              </div>
              <p className="mt-0.5 text-sm text-slate-700">{entry.body}</p>
            </li>
          ))}
        </ul>
      )}

      {can('post_comment') && (
        <div className="flex gap-1.5">
          <input
            className={controlClass}
            placeholder="Write a message…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          <Button variant="primary" size="sm" onClick={submit} disabled={!body.trim()}>
            Post
          </Button>
        </div>
      )}
    </div>
  )
}
