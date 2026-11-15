import { NumberInput as MantineNumberInput } from '@mantine/core'
import classes from './NumberInput.module.css'

export type Props = {
  label: string
  unit: string
  /** The field keeps its own text after this, since a half-typed "12," is no number a parent could hand back. */
  defaultValue: number | null
  onChange: (value: number | null) => void
}

const numberOf = (typed: number | string) => {
  const value = typeof typed === 'number' ? typed : Number.parseFloat(typed.replace(',', '.'))

  return Number.isNaN(value) ? null : value
}

export const NumberInput = ({ label, unit, defaultValue, onChange }: Props) => (
  <MantineNumberInput
    label={label}
    defaultValue={defaultValue ?? ''}
    min={0}
    decimalScale={2}
    decimalSeparator=","
    hideControls
    rightSection={<span className={classes.unit}>{unit}</span>}
    rightSectionPointerEvents="none"
    classNames={{ label: classes.label, input: classes.input }}
    onChange={(typed) => onChange(numberOf(typed))}
  />
)
