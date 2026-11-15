import { Switch as MantineSwitch } from '@mantine/core'
import classes from './Switch.module.css'

export type Props = {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export const Switch = ({ label, checked, onChange }: Props) => (
  <MantineSwitch
    label={label}
    labelPosition="left"
    checked={checked}
    classNames={{
      body: classes.body,
      labelWrapper: classes.labelWrapper,
      label: classes.label,
      track: classes.track,
    }}
    onChange={(event) => onChange(event.currentTarget.checked)}
  />
)
