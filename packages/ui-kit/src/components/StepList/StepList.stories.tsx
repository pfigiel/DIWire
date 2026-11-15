import type { Meta, StoryObj } from '@storybook/react-vite'
import { Text } from '../Text'
import { StepList } from './StepList'

const meta = {
  component: StepList,
  parameters: { layout: 'padded' },
  args: {
    label: 'Floor plan steps',
    steps: [
      { key: 'file', label: 'File', summary: 'projekt.pdf · page 2', state: 'done' },
      { key: 'crop', label: 'Crop & rotate', state: 'current' },
      { key: 'scale', label: 'Scale', state: 'upcoming' },
      { key: 'walls', label: 'Walls', state: 'upcoming' },
    ],
    children: (
      <Text size="sm" tone="dimmed">
        Place the frame exactly on the outer walls of the building.
      </Text>
    ),
    onSelect: () => undefined,
  },
} satisfies Meta<typeof StepList>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Revisiting: Story = {
  args: {
    steps: [
      { key: 'file', label: 'File', summary: 'projekt.pdf · page 2', state: 'done' },
      { key: 'crop', label: 'Crop & rotate', state: 'current' },
      { key: 'scale', label: 'Scale', summary: '12,00 × 9,00 m', state: 'done' },
      { key: 'walls', label: 'Walls', state: 'available' },
    ],
  },
}
