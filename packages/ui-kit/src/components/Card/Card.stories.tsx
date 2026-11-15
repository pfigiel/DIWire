import type { Meta, StoryObj } from '@storybook/react-vite'
import { Text } from '../Text'
import { Card } from './Card'

const meta = {
  component: Card,
  args: {
    children: (
      <Card.Body>
        <Text>Content that needs padding sits in a body.</Text>
      </Card.Body>
    ),
  },
} satisfies Meta<typeof Card>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}
