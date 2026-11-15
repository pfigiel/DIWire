import { createTheme } from '@mantine/core'
import { fixedTokens } from './tokens'

export const theme = createTheme({
  fontFamily: fixedTokens.font.family.body,
  headings: { fontFamily: fixedTokens.font.family.body },
})
