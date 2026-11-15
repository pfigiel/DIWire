import { Tabs as MantineTabs } from '@mantine/core'
import type { ReactNode } from 'react'
import classes from './Tabs.module.css'

export type Props = {
  value: string
  /** Names the tab list for assistive technology. */
  label: string
  children: ReactNode
}

type TabProps = {
  value: string
  disabled?: boolean
  children: ReactNode
}

const Tab = ({ value, disabled, children }: TabProps) => (
  <MantineTabs.Tab value={value} disabled={disabled} className={classes.tab}>
    {children}
  </MantineTabs.Tab>
)

export const Tabs = ({ value, label, children }: Props) => (
  <MantineTabs value={value} className={classes.root}>
    <MantineTabs.List aria-label={label} className={classes.list}>
      {children}
    </MantineTabs.List>
  </MantineTabs>
)

Tabs.Tab = Tab
