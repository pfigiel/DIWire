import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import classes from './InlineField.module.css'

type Props = {
  /** Names the field for assistive technology; on the plan it has no visible label. */
  label: string
  initial: string
  /** How wide the field is, in characters. */
  size: number
  onSubmit: (value: string) => void
  onCancel: () => void
}

/** A field typed into in place, on the plan: Enter keeps the value, Escape or leaving drops it. */
export const InlineField = ({ label, initial, size, onSubmit, onCancel }: Props) => {
  const [value, setValue] = useState(initial)

  const settle = (event: KeyboardEvent) => {
    if (event.key === 'Enter') onSubmit(value)
    else if (event.key === 'Escape') onCancel()
    else return

    // Escape would otherwise also call off whatever the step is doing, and Enter press a button.
    event.stopPropagation()
  }

  const field = useRef<HTMLInputElement>(null)

  // Once, as the field appears: selecting on every render would make each key replace the last.
  useEffect(() => {
    field.current?.focus()
    field.current?.select()
  }, [])

  return (
    <input
      ref={field}
      aria-label={label}
      className={classes.root}
      size={size}
      value={value}
      onChange={(event) => setValue(event.currentTarget.value)}
      onKeyDown={settle}
      onBlur={onCancel}
    />
  )
}
