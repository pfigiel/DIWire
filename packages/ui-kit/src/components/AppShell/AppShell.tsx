import { AppShell as MantineAppShell } from '@mantine/core'
import clsx from 'clsx'
import type { ReactNode } from 'react'
import classes from './AppShell.module.css'

export type Props = {
  header: ReactNode
  sidebar?: ReactNode
  children: ReactNode
}

export const AppShell = ({ header, sidebar, children }: Props) => {
  const hasSidebar = sidebar !== undefined

  return (
    <MantineAppShell
      header={{ height: 'var(--dw-shell-header-height)' }}
      navbar={hasSidebar ? { width: 'var(--dw-shell-sidebar-width)', breakpoint: 0 } : undefined}
    >
      <MantineAppShell.Header data-surface className={classes.header}>
        {header}
      </MantineAppShell.Header>
      {hasSidebar ? (
        <MantineAppShell.Navbar data-surface className={classes.sidebar}>
          {sidebar}
        </MantineAppShell.Navbar>
      ) : null}
      <MantineAppShell.Main className={clsx(hasSidebar && classes.workspace)}>
        {children}
      </MantineAppShell.Main>
    </MantineAppShell>
  )
}
