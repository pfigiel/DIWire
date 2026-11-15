export const tokens = {
  font: {
    family: { body: "'Inter Variable', system-ui, sans-serif" },
    weight: { regular: '400', semibold: '600', bold: '700' },
  },
  text: {
    color: { default: '#1c1f24', dimmed: '#5f6773' },
    font: { size: { sm: '0.875rem', md: '1rem' } },
    line: { height: '1.6' },
  },
  heading: {
    font: { size: { sm: '1rem', md: '1.25rem', lg: '1.75rem' } },
    line: { height: '1.2' },
    letter: { spacing: '-0.02em' },
  },
  accent: { color: { default: '#2456d3', hover: '#1a3f9e' }, contrast: { color: '#ffffff' } },
  control: {
    height: { sm: '2.25rem', md: '2.875rem' },
    /** Translucent, so a hovered control darkens whatever surface it sits on. */
    hover: { background: { color: 'rgb(0 0 0 / 5%)' } },
  },
  /** Translucent, so an edge or a divider stays as distinct on every surface it lies on. */
  border: { color: 'rgb(0 0 0 / 10%)' },
  /** The page, then each level of nesting a step further from it; see `data-surface` in globals.css. */
  surface: {
    canvas: { background: { color: '#f4f5f7' } },
    1: { background: { color: '#ffffff' } },
    2: { background: { color: '#f9fafb' } },
    3: { background: { color: '#f1f3f5' } },
  },
  spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem' },
  radius: { md: '0.625rem', lg: '1rem', full: '9999px' },
  shell: { header: { height: '3.75rem' } },
  logo: {
    size: { md: '1.75rem', lg: '2.5rem' },
    font: { size: { md: '1.125rem', lg: '1.5rem' } },
  },
  icon: { size: { md: '1.125rem' } },
  layout: { width: { sm: '25rem' } },
  motion: { duration: '200ms', easing: 'ease' },
} as const

/** Resolved tokens, as the `--dw-*` custom properties a stylesheet reads. */
export type CssVariables = Record<string, string>
