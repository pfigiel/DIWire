import { MantineProvider } from '@mantine/core'
import type { ReactNode } from 'react'
import { cssVariablesResolver } from './css-variables'
import './fonts'
import { theme } from './theme'

export type Props = {
  /** Pins the scheme instead of following the system's; Storybook's toolbar sets it. */
  colorScheme?: 'light' | 'dark'
  children: ReactNode
}

export const UiProvider = ({ colorScheme, children }: Props) => (
  <MantineProvider
    theme={theme}
    cssVariablesResolver={cssVariablesResolver}
    defaultColorScheme="auto"
    forceColorScheme={colorScheme}
  >
    {children}
  </MantineProvider>
)
