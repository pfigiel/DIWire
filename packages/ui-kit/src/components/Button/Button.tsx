import { Button as MantineButton } from '@mantine/core'
import clsx from 'clsx'
import type { ReactNode } from 'react'
import classes from './Button.module.css'

type Variant = 'primary' | 'secondary'

export type Props = {
  variant?: Variant
  icon?: ReactNode
  className?: string
  children: ReactNode
  onClick: () => void
}

export const Button = ({ variant = 'primary', icon, className, children, onClick }: Props) => (
  <MantineButton
    leftSection={icon}
    className={clsx(classes.root, classes[variant], className)}
    onClick={onClick}
  >
    {children}
  </MantineButton>
)
