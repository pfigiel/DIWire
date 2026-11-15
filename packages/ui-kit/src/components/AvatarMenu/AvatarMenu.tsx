import { Menu, UnstyledButton } from '@mantine/core'
import type { ReactNode } from 'react'
import classes from './AvatarMenu.module.css'

export type Props = {
  /** Names the button for assistive technology; the initial alone says nothing. */
  label: string
  initial: string
  children: ReactNode
}

type LabelProps = {
  children: ReactNode
}

type ItemProps = {
  children: ReactNode
  onClick: () => void
}

const Label = ({ children }: LabelProps) => (
  <Menu.Label className={classes.label}>{children}</Menu.Label>
)

const Item = ({ children, onClick }: ItemProps) => (
  <Menu.Item className={classes.item} onClick={onClick}>
    {children}
  </Menu.Item>
)

export const AvatarMenu = ({ label, initial, children }: Props) => (
  <Menu position="bottom-end">
    <Menu.Target>
      <UnstyledButton aria-label={label} className={classes.trigger}>
        {initial}
      </UnstyledButton>
    </Menu.Target>
    <Menu.Dropdown className={classes.dropdown}>{children}</Menu.Dropdown>
  </Menu>
)

AvatarMenu.Label = Label
AvatarMenu.Item = Item
