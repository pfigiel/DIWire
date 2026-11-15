import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Switch } from './Switch'

const meta = {
  component: Switch,
  args: { label: 'Plan underneath', checked: true, onChange: () => undefined },
  render: function Stateful(args) {
    const [checked, setChecked] = useState(args.checked)

    return <Switch {...args} checked={checked} onChange={setChecked} />
  },
} satisfies Meta<typeof Switch>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Off: Story = { args: { checked: false } }
