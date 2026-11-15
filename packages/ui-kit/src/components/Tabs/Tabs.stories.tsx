import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tabs } from './Tabs'

const meta = {
  component: Tabs,
  args: {
    value: 'plan',
    label: 'Modules',
    children: (
      <>
        <Tabs.Tab value="plan">Floor plan</Tabs.Tab>
        <Tabs.Tab value="electrical" disabled>
          Electrical
        </Tabs.Tab>
      </>
    ),
  },
} satisfies Meta<typeof Tabs>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}
