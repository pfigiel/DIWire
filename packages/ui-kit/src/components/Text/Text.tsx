import { Text as MantineText } from '@mantine/core'
import clsx from 'clsx'
import type { ReactNode } from 'react'
import classes from './Text.module.css'

type Size = 'sm' | 'md'
type Tone = 'default' | 'dimmed'

export type Props = {
  size?: Size
  tone?: Tone
  children: ReactNode
}

export const Text = ({ size = 'md', tone = 'default', children }: Props) => (
  <MantineText className={clsx(classes[tone], classes[size])}>{children}</MantineText>
)
