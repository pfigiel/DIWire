import type { Meta, StoryObj } from '@storybook/react-vite'
import { Logo } from '../Logo'
import { Text } from '../Text'
import { AppShell } from './AppShell'

const meta = {
  component: AppShell,
  parameters: { layout: 'fullscreen' },
  args: { header: <Logo />, children: <Text>Page content</Text> },
} satisfies Meta<typeof AppShell>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithSidebar: Story = { args: { sidebar: <Text>Sidebar content</Text> } }
