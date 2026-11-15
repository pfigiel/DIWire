import type { Preview } from '@storybook/react-vite'
import { UiProvider } from '../src'
import '../src/globals.css'

const preview: Preview = {
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <UiProvider>
        <Story />
      </UiProvider>
    ),
  ],
}

export default preview
