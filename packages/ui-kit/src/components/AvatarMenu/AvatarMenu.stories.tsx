import type { Meta, StoryObj } from '@storybook/react-vite'
import { AvatarMenu } from './AvatarMenu'

const meta = {
  component: AvatarMenu,
  args: {
    label: 'Account',
    initial: 'P',
    children: (
      <>
        <AvatarMenu.Label>jan.kowalski@example.com</AvatarMenu.Label>
        <AvatarMenu.Item onClick={() => undefined}>Sign out</AvatarMenu.Item>
      </>
    ),
  },
} satisfies Meta<typeof AvatarMenu>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}
