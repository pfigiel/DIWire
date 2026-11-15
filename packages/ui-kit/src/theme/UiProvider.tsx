import { MantineProvider } from '@mantine/core'
import type { ReactNode } from 'react'
import { cssVariablesResolver } from './css-variables'
import './fonts'
import { theme } from './theme'

export type Props = {
  /** Pins the scheme; Storybook's toolbar sets it. The app is light without it. */
  colorScheme?: 'light' | 'dark'
  children: ReactNode
}

export const UiProvider = ({ colorScheme, children }: Props) => (
  <MantineProvider
    theme={theme}
    cssVariablesResolver={cssVariablesResolver}
    defaultColorScheme="light"
    forceColorScheme={colorScheme}
  >
    {children}
  </MantineProvider>
)
