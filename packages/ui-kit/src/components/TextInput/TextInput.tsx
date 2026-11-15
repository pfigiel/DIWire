import { TextInput as MantineTextInput } from '@mantine/core'
import classes from './TextInput.module.css'

export type Props = {
  label: string
  value: string
  /** Takes the focus when the modal it sits in opens, which otherwise lands on the close button. */
  initialFocus?: boolean
  onChange: (value: string) => void
}

export const TextInput = ({ label, value, initialFocus = false, onChange }: Props) => (
  <MantineTextInput
    label={label}
    value={value}
    data-autofocus={initialFocus || undefined}
    classNames={{ label: classes.label, input: classes.input }}
    onChange={(event) => onChange(event.currentTarget.value)}
  />
)
