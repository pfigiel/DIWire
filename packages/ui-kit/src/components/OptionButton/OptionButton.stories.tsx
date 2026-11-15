import type { Meta, StoryObj } from '@storybook/react-vite'
import { OptionButton } from './OptionButton'

const meta = {
  component: OptionButton,
  args: { selected: false, detail: '25 cm', children: 'Load-bearing', onClick: () => undefined },
} satisfies Meta<typeof OptionButton>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Selected: Story = { args: { selected: true } }
