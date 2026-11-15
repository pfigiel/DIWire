import { Modal as MantineModal } from '@mantine/core'
import type { ReactNode } from 'react'
import classes from './Modal.module.css'

export type Props = {
  opened: boolean
  title: string
  children: ReactNode
  onClose: () => void
}

export const Modal = ({ opened, title, children, onClose }: Props) => (
  <MantineModal
    opened={opened}
    title={title}
    centered
    classNames={{
      content: classes.content,
      header: classes.header,
      title: classes.title,
      body: classes.body,
    }}
    onClose={onClose}
  >
    {children}
  </MantineModal>
)
