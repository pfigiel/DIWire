import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconShare, IconTrash } from '@tabler/icons-react'
import { ActionMenu } from './ActionMenu'

const meta = {
  component: ActionMenu,
  args: {
    label: 'Project options',
    children: (
      <>
        <ActionMenu.Item icon={<IconShare aria-hidden />} onClick={() => undefined}>
          Share
        </ActionMenu.Item>
        <ActionMenu.Item icon={<IconTrash aria-hidden />} onClick={() => undefined}>
          Delete
        </ActionMenu.Item>
      </>
    ),
  },
} satisfies Meta<typeof ActionMenu>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}
