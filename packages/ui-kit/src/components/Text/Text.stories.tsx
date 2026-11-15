import type { Meta, StoryObj } from '@storybook/react-vite'
import { Text } from './Text'

const meta = {
  component: Text,
  args: { children: 'The quick brown fox jumps over the lazy dog.' },
} satisfies Meta<typeof Text>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}
