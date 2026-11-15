import { AppShell as MantineAppShell } from '@mantine/core'
import type { ReactNode } from 'react'
import classes from './AppShell.module.css'

export type Props = {
  header: ReactNode
  children: ReactNode
}

export const AppShell = ({ header, children }: Props) => (
  <MantineAppShell header={{ height: 'var(--dw-shell-header-height)' }}>
    <MantineAppShell.Header data-surface className={classes.header}>
      {header}
    </MantineAppShell.Header>
    <MantineAppShell.Main>{children}</MantineAppShell.Main>
  </MantineAppShell>
)
