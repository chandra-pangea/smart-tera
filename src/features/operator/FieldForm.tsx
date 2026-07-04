import { useState } from 'react'
import type { Edit, FieldCondition } from '@/types/types'
import { useFieldTask } from '@/hooks/useFieldTask'
import { CONDITION_LABEL } from '@/features/edits/FieldSubmissionCard'
import { Field } from '@/components/Field'
import { Button } from '@/components/Button'
import { controlClass } from '@/components/controls'

const CONDITIONS: FieldCondition[] = ['good', 'needs_attention', 'faulty']

/** The operator's field form — captured against the Edit as the submission. */
export function FieldForm({ edit, onDone }: { edit: Edit; onDone: () => void }) {
  const { submit } = useFieldTask()
  const [observedValue, setObservedValue] = useState('')
  const [condition, setCondition] = useState<FieldCondition>('good')
  const [notes, setNotes] = useState('')
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>()

  const onPhoto = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhotoDataUrl(reader.result as string)
    reader.readAsDataURL(file)
  }

  const onSubmit = () => {
    submit({ editId: edit.id, observedValue, condition, notes, photoDataUrl })
    onDone()
  }

  return (
    <div className="space-y-3">
      {edit.fieldTask?.instruction && (
        <p className="rounded bg-slate-50 p-2 text-xs text-slate-600">{edit.fieldTask.instruction}</p>
      )}
      <Field label="Observed value">
        <input
          className={controlClass}
          value={observedValue}
          onChange={(e) => setObservedValue(e.target.value)}
          placeholder="e.g. 38 psi"
        />
      </Field>
      <Field label="Condition">
        <select
          className={controlClass}
          value={condition}
          onChange={(e) => setCondition(e.target.value as FieldCondition)}
        >
          {CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {CONDITION_LABEL[c]}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Notes">
        <textarea
          className={controlClass}
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Field>
      <Field label="Photo (optional)">
        <input
          type="file"
          accept="image/*"
          className="text-xs"
          onChange={(e) => onPhoto(e.target.files?.[0])}
        />
      </Field>
      {photoDataUrl && <img src={photoDataUrl} alt="preview" className="max-h-28 rounded border" />}
      <Button variant="primary" onClick={onSubmit} disabled={!observedValue.trim()}>
        Submit field results
      </Button>
    </div>
  )
}
