import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'

const meta = {
  component: Button,
  args: { children: 'Continue', onClick: () => undefined },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Secondary: Story = { args: { variant: 'secondary' } }
