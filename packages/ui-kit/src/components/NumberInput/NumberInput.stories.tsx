import type { Meta, StoryObj } from '@storybook/react-vite'
import { NumberInput } from './NumberInput'

const meta = {
  component: NumberInput,
  args: { label: 'Width', unit: 'm', defaultValue: 12, onChange: () => undefined },
} satisfies Meta<typeof NumberInput>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Empty: Story = { args: { defaultValue: null } }
