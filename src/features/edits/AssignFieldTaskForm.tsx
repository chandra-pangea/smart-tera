import { useState } from 'react'
import { useAppDispatch } from '@/app/hooks'
import { operators } from '@/lib/seedUsers'
import { assignFieldTask } from '@/features/edits/editActions'
import { Modal } from '@/components/Modal'
import { Field } from '@/components/Field'
import { Button } from '@/components/Button'
import { controlClass } from '@/components/controls'

interface AssignFieldTaskFormProps {
  editId: string
  targetElementId?: string
  onClose: () => void
}

export function AssignFieldTaskForm({ editId, targetElementId, onClose }: AssignFieldTaskFormProps) {
  const dispatch = useAppDispatch()
  const ops = operators()
  const [operatorId, setOperatorId] = useState(ops[0]?.id ?? '')
  const [instruction, setInstruction] = useState('')

  const submit = () => {
    dispatch(assignFieldTask({ editId, operatorId, instruction, targetElementId }))
    onClose()
  }

  return (
    <Modal title="Assign field task" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Operator">
          <select
            className={controlClass}
            value={operatorId}
            onChange={(e) => setOperatorId(e.target.value)}
          >
            {ops.map((op) => (
              <option key={op.id} value={op.id}>
                {op.name}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="Instruction"
          hint={targetElementId ? `Target element: ${targetElementId}` : 'No specific element targeted'}
        >
          <textarea
            className={controlClass}
            rows={3}
            placeholder="What should the operator check on site?"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
          />
        </Field>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submit} disabled={!operatorId || !instruction.trim()}>
            Assign
          </Button>
        </div>
      </div>
    </Modal>
  )
}
