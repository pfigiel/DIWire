import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { TextInput } from './TextInput'

const meta = {
  component: TextInput,
  args: { label: 'Project name', value: 'Our house', onChange: () => undefined },
  render: function Stateful(args) {
    const [value, setValue] = useState(args.value)

    return <TextInput {...args} value={value} onChange={setValue} />
  },
} satisfies Meta<typeof TextInput>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}
