import type { Meta, StoryObj } from '@storybook/react-vite'
import { Text } from '../Text'
import { Modal } from './Modal'

const meta = {
  component: Modal,
  args: {
    opened: true,
    title: 'New project',
    children: <Text>Modal content</Text>,
    onClose: () => undefined,
  },
} satisfies Meta<typeof Modal>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}
