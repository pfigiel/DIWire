import { Button as MantineButton } from '@mantine/core'
import clsx from 'clsx'
import type { ReactNode } from 'react'
import classes from './Button.module.css'

type Variant = 'primary' | 'secondary'
type Size = 'sm' | 'md'

export type Props = {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  disabled?: boolean
  loading?: boolean
  className?: string
  children: ReactNode
  onClick: () => void
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  icon,
  disabled,
  loading,
  className,
  children,
  onClick,
}: Props) => (
  <MantineButton
    leftSection={icon}
    disabled={disabled}
    loading={loading}
    className={clsx(classes.root, classes[variant], classes[size], className)}
    onClick={onClick}
  >
    {children}
  </MantineButton>
)
