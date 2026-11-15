import { Paper } from '@mantine/core'
import clsx from 'clsx'
import type { ReactNode } from 'react'
import classes from './Card.module.css'

export type Props = {
  className?: string
  children: ReactNode
}

type BodyProps = {
  className?: string
  children: ReactNode
}

const Body = ({ className, children }: BodyProps) => (
  <div className={clsx(classes.body, className)}>{children}</div>
)

export const Card = ({ className, children }: Props) => (
  <Paper data-surface className={clsx(classes.root, className)}>
    {children}
  </Paper>
)

Card.Body = Body
