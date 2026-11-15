import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconZoomIn } from '@tabler/icons-react'
import { IconButton } from './IconButton'

const meta = {
  component: IconButton,
  args: { label: 'Zoom in', children: <IconZoomIn aria-hidden />, onClick: () => undefined },
} satisfies Meta<typeof IconButton>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}
