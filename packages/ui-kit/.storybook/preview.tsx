import { withThemeFromJSXProvider } from '@storybook/addon-themes'
import type { Preview } from '@storybook/react-vite'
import { StoryUiProvider, type Theme } from './StoryUiProvider'
import '../src/globals.css'

const themes = {
  light: { colorScheme: 'light' },
  dark: { colorScheme: 'dark' },
} satisfies Record<string, Theme>

const preview: Preview = {
  parameters: { layout: 'centered' },
  decorators: [
    withThemeFromJSXProvider({ themes, defaultTheme: 'light', Provider: StoryUiProvider }),
  ],
}

export default preview
