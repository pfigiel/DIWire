import type { CSSVariablesResolver } from '@mantine/core'
import { flattenTokens } from './flatten-tokens'
import { toCssVariables } from './to-css-variables'
import { tokens } from './tokens'

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: toCssVariables(flattenTokens(tokens)),
  light: {
    // The shell paints the page itself, from a variable no stylesheet of ours may name. Mantine
    // defines it per scheme, so it is overridden there rather than among the variables above.
    '--mantine-color-body': tokens.surface.canvas.background.color,
  },
  dark: {},
})
