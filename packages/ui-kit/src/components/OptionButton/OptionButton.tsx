import { UnstyledButton } from '@mantine/core'
import type { ReactNode } from 'react'
import classes from './OptionButton.module.css'

export type Props = {
  selected: boolean
  /** Shown before the label, such as a swatch of what the option stands for. */
  icon?: ReactNode
  /** A secondary value at the far end, such as a measurement. */
  detail?: string
  children: ReactNode
  onClick: () => void
}

/** One choice out of a short list shown in full, where the picked one stays pressed. */
export const OptionButton = ({ selected, icon, detail, children, onClick }: Props) => (
  <UnstyledButton aria-pressed={selected} className={classes.root} onClick={onClick}>
    {icon}
    <span className={classes.label}>{children}</span>
    {detail === undefined ? null : <span className={classes.detail}>{detail}</span>}
  </UnstyledButton>
)
