import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Slider } from './Slider'

const meta = {
  component: Slider,
  parameters: { layout: 'padded' },
  args: {
    label: 'Fine rotation',
    value: -1.2,
    min: -10,
    max: 10,
    step: 0.1,
    onChange: () => undefined,
  },
  render: function Stateful(args) {
    const [value, setValue] = useState(args.value)

    return <Slider {...args} value={value} onChange={setValue} />
  },
} satisfies Meta<typeof Slider>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}
