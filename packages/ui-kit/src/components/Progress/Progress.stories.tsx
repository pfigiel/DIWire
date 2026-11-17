import type { Meta, StoryObj } from '@storybook/react-vite'
import { Progress } from './Progress'

const meta = {
  component: Progress,
  args: { label: 'Verified', value: 4, max: 14 },
} satisfies Meta<typeof Progress>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Done: Story = { args: { value: 14 } }
