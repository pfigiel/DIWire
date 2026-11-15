import type { CSSVariablesResolver } from '@mantine/core'
import { flattenTokens } from './flatten-tokens'
import { toCssVariables } from './to-css-variables'
import { fixedTokens, schemeTokens, type CssVariables } from './tokens'

const schemeVariablesOf = (scheme: keyof typeof schemeTokens): CssVariables => {
  const tokens = schemeTokens[scheme]

  return {
    ...toCssVariables(flattenTokens(tokens)),
    // The shell paints the page itself, from a variable no stylesheet of ours may name.
    '--mantine-color-body': tokens.surface.canvas.background.color,
  }
}

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: toCssVariables(flattenTokens(fixedTokens)),
  light: schemeVariablesOf('light'),
  dark: schemeVariablesOf('dark'),
})
