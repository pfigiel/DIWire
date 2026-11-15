type SchemeTokens = {
  text: { color: Record<'default' | 'dimmed', string> }
  /** Translucent, so an edge or a divider stays as distinct on every surface it lies on. */
  border: { color: string }
  /** The page, then each level of nesting a step further from it; see `data-surface` in globals.css. */
  surface: Record<'canvas' | 1 | 2 | 3, { background: { color: string } }>
}

export const schemeTokens: Record<'light' | 'dark', SchemeTokens> = {
  light: {
    text: { color: { default: '#1c1f24', dimmed: '#5f6773' } },
    border: { color: 'rgb(0 0 0 / 10%)' },
    surface: {
      canvas: { background: { color: '#f4f5f7' } },
      1: { background: { color: '#ffffff' } },
      2: { background: { color: '#f9fafb' } },
      3: { background: { color: '#f1f3f5' } },
    },
  },
  dark: {
    text: { color: { default: '#e8eaed', dimmed: '#9aa1ab' } },
    border: { color: 'rgb(255 255 255 / 10%)' },
    surface: {
      canvas: { background: { color: '#14161a' } },
      1: { background: { color: '#1c1f24' } },
      2: { background: { color: '#23272d' } },
      3: { background: { color: '#2b3037' } },
    },
  },
}

export const fixedTokens = {
  font: {
    family: { body: "'Inter Variable', system-ui, sans-serif" },
    weight: { regular: '400', semibold: '600', bold: '700' },
  },
  text: {
    font: { size: { sm: '0.875rem', md: '1rem' } },
    line: { height: '1.6' },
  },
  heading: {
    font: { size: { sm: '1rem', md: '1.25rem', lg: '1.75rem' } },
    line: { height: '1.2' },
    letter: { spacing: '-0.02em' },
  },
  spacing: { sm: '0.5rem' },
  motion: { duration: '200ms', easing: 'ease' },
} as const

/** Resolved tokens, as the `--dw-*` custom properties a stylesheet reads. */
export type CssVariables = Record<string, string>
