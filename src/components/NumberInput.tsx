import { useEffect, useRef, useState } from 'react'
import { controlClass } from './controls'

interface NumberInputProps {
  value: number
  disabled?: boolean
  onCommit: (value: number) => void
}

/**
 * A number input you can actually type in. Keeps local text state while focused
 * so you can clear the field and type a fresh value (e.g. replace "0" with
 * "210") without it snapping back. Commits valid numbers as you type; on blur,
 * an empty/invalid entry reverts to the last committed value.
 */
export function NumberInput({ value, disabled, onCommit }: NumberInputProps) {
  const [text, setText] = useState(String(value))
  const focused = useRef(false)

  // Re-sync when the underlying value changes externally (e.g. a new selection),
  // but never while the user is actively typing.
  useEffect(() => {
    if (!focused.current) setText(String(value))
  }, [value])

  return (
    <input
      type="number"
      className={controlClass}
      disabled={disabled}
      value={text}
      onFocus={() => {
        focused.current = true
      }}
      onChange={(e) => {
        const next = e.target.value
        setText(next)
        const parsed = Number(next)
        if (next.trim() !== '' && !Number.isNaN(parsed)) onCommit(parsed)
      }}
      onBlur={() => {
        focused.current = false
        const parsed = Number(text)
        if (text.trim() === '' || Number.isNaN(parsed)) {
          setText(String(value)) // revert an empty/invalid entry
        } else {
          onCommit(parsed)
        }
      }}
    />
  )
}
