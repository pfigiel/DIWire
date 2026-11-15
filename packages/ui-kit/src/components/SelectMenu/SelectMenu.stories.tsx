import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconPlus, IconStack2 } from '@tabler/icons-react'
import { SelectMenu } from './SelectMenu'

const meta = {
  component: SelectMenu,
  parameters: { layout: 'padded' },
  args: {
    label: 'Ground floor',
    icon: <IconStack2 aria-hidden />,
    children: (
      <>
        <SelectMenu.Item selected onClick={() => undefined}>
          Ground floor
        </SelectMenu.Item>
        <SelectMenu.Item onClick={() => undefined}>First floor</SelectMenu.Item>
        <SelectMenu.Divider />
        <SelectMenu.Item icon={<IconPlus aria-hidden />} onClick={() => undefined}>
          Add floor
        </SelectMenu.Item>
      </>
    ),
  },
} satisfies Meta<typeof SelectMenu>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}
