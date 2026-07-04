import { useAppDispatch } from '@/app/hooks'
import type { NetworkElement } from '@/types/types'
import { describeElement, ELEMENT_TYPE_LABEL, PROPERTY_FIELDS } from '@/lib/elements'
import { editElementProperties, removeElement } from '@/features/edits/editActions'
import { usePermissions } from '@/hooks/usePermissions'
import { Panel } from '@/components/Panel'
import { Field } from '@/components/Field'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { NumberInput } from '@/components/NumberInput'
import { controlClass } from '@/components/controls'

/**
 * Shows the selected element's properties and — for roles that can edit —
 * lets you change them. Rendered generically from PROPERTY_FIELDS so it never
 * hard-codes per-type forms. Changes flow into the active draft, not the map.
 */
export function PropertyInspector({ element }: { element: NetworkElement }) {
  const dispatch = useAppDispatch()
  const { can } = usePermissions()
  const editable = can('edit_element')
  const record = element as unknown as Record<string, unknown>

  const update = (key: string, value: string | number) => {
    dispatch(editElementProperties(element.id, { [key]: value }))
  }

  return (
    <Panel
      title={
        <span className="flex items-center gap-2">
          {describeElement(element)}
          <Badge className="bg-slate-100 text-slate-500">{ELEMENT_TYPE_LABEL[element.type]}</Badge>
        </span>
      }
      actions={
        can('remove_element') ? (
          <Button size="sm" variant="danger" onClick={() => dispatch(removeElement(element.id))}>
            Delete
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-2">
        {PROPERTY_FIELDS[element.type].map((field) => {
          const value = record[field.key]
          if (field.kind === 'readonly') {
            return (
              <Field key={field.key} label={field.label}>
                <div className="text-sm text-slate-700">{String(value)}</div>
              </Field>
            )
          }
          if (field.kind === 'select') {
            return (
              <Field key={field.key} label={field.label}>
                <select
                  className={controlClass}
                  disabled={!editable}
                  value={String(value)}
                  onChange={(e) => update(field.key, e.target.value)}
                >
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </Field>
            )
          }
          return (
            <Field key={field.key} label={field.label}>
              <NumberInput
                value={Number(value)}
                disabled={!editable}
                onCommit={(n) => update(field.key, n)}
              />
            </Field>
          )
        })}
        {!editable && (
          <p className="text-[11px] text-slate-400">Read-only — your role can view but not edit.</p>
        )}
      </div>
    </Panel>
  )
}
