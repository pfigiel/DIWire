import type { Meta, StoryObj } from '@storybook/react-vite'
import { Dropzone } from './Dropzone'

const meta = {
  component: Dropzone,
  parameters: { layout: 'padded' },
  args: {
    title: 'Drop your floor plan here',
    hint: 'PDF, JPG or PNG',
    action: 'Choose file',
    accept: ['application/pdf', 'image/jpeg', 'image/png'],
    onDrop: () => undefined,
  },
} satisfies Meta<typeof Dropzone>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}
