import { useState } from 'react'
import { useAppSelector } from '@/app/hooks'
import { selectEditById } from '@/features/edits/editsSelectors'
import { ApprovalQueue } from '@/features/edits/ApprovalQueue'
import { EditReview } from '@/features/edits/EditReview'
/**
 * Admin sidebar — governance-first. The approval queue + review is the default
 * tab.
 */
export function AdminWorkspace() {
  const [reviewId, setReviewId] = useState<string | null>(null)
  const review = useAppSelector((s) => (reviewId ? selectEditById(s, reviewId) : undefined))

  return (
    <>
      <ApprovalQueue selectedId={reviewId} onSelect={setReviewId} />
      {review && <EditReview edit={review} />}
    </>
  )
}
