import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { SegmentedControl } from './SegmentedControl'

const options = [
  { value: 'draw', label: 'Draw' },
  { value: 'select', label: 'Select' },
]

const meta = {
  component: SegmentedControl,
  args: { label: 'Tool', value: 'draw', options, onChange: () => undefined },
  render: function Stateful(args) {
    const [value, setValue] = useState(args.value)

    return <SegmentedControl {...args} value={value} onChange={setValue} />
  },
} satisfies Meta<typeof SegmentedControl>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}
