import { Menu, UnstyledButton } from '@mantine/core'
import { IconCheck, IconChevronDown } from '@tabler/icons-react'
import clsx from 'clsx'
import type { ReactNode } from 'react'
import classes from './SelectMenu.module.css'

export type Props = {
  label: string
  icon?: ReactNode
  children: ReactNode
}

type ItemProps = {
  icon?: ReactNode
  selected?: boolean
  children: ReactNode
  onClick: () => void
}

const Item = ({ icon, selected, children, onClick }: ItemProps) => (
  <Menu.Item
    leftSection={icon}
    rightSection={selected ? <IconCheck aria-hidden className={classes.icon} /> : undefined}
    aria-current={selected ? 'true' : undefined}
    className={clsx(classes.item, selected && classes.selected)}
    onClick={onClick}
  >
    {children}
  </Menu.Item>
)

const Divider = () => <Menu.Divider className={classes.divider} />

export const SelectMenu = ({ label, icon, children }: Props) => (
  <Menu width="target" position="bottom-start">
    <Menu.Target>
      <UnstyledButton className={classes.trigger}>
        {icon}
        <span className={classes.label}>{label}</span>
        <IconChevronDown aria-hidden className={classes.icon} />
      </UnstyledButton>
    </Menu.Target>
    <Menu.Dropdown className={classes.dropdown}>{children}</Menu.Dropdown>
  </Menu>
)

SelectMenu.Item = Item
SelectMenu.Divider = Divider
