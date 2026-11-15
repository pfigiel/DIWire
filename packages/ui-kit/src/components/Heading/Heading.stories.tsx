import type { Meta, StoryObj } from '@storybook/react-vite'
import { Heading } from './Heading'

const meta = {
  component: Heading,
  args: { children: 'Section heading' },
} satisfies Meta<typeof Heading>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}
