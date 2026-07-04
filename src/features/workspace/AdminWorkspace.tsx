import { useState } from 'react'
import { useAppSelector } from '@/app/hooks'
import { selectEditById } from '@/features/edits/editsSelectors'
import { Tabs } from '@/components/Tabs'
import { ApprovalQueue } from '@/features/edits/ApprovalQueue'
import { EditReview } from '@/features/edits/EditReview'
import { EditTools } from './EditTools'

type AdminTab = 'approvals' | 'edit'

/**
 * Admin sidebar — governance-first. The approval queue + review is the default
 * tab; the "Edit map" tab exposes the same editing tools as an Editor, since
 * Admin is a superset (can edit *and* approve).
 */
export function AdminWorkspace() {
  const [tab, setTab] = useState<AdminTab>('approvals')
  const [reviewId, setReviewId] = useState<string | null>(null)
  const review = useAppSelector((s) => (reviewId ? selectEditById(s, reviewId) : undefined))

  return (
    <>
      <Tabs<AdminTab>
        tabs={[
          { id: 'approvals', label: 'Approvals' },
          { id: 'edit', label: 'Edit map' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'approvals' ? (
        <>
          <ApprovalQueue selectedId={reviewId} onSelect={setReviewId} />
          {review && <EditReview edit={review} onModify={() => setTab('edit')} />}
        </>
      ) : (
        <EditTools />
      )}
    </>
  )
}
