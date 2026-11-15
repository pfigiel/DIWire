import type { ReactNode } from 'react'
import { UiProvider } from '../src'

type ColorScheme = 'light' | 'dark'

export type Theme = { colorScheme: ColorScheme }

type Props = {
  theme: Theme
  children: ReactNode
}

export const StoryUiProvider = ({ theme, children }: Props) => (
  <UiProvider colorScheme={theme.colorScheme}>{children}</UiProvider>
)
