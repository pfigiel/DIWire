# @diwire/ui-kit

Every component and every design token the app renders. Mantine supplies structure, accessibility
and behaviour; this package supplies the look and a narrow prop surface, so a screen cannot reach
Mantine directly — [`apps/web`](../../apps/web) lints that import away.

```tsx
import { Heading, Text, UiProvider } from '@diwire/ui-kit'
import '@diwire/ui-kit/styles.css'
```

Rules for adding a component or a token are in [AGENTS.md](../../AGENTS.md#ui).

## Theme

`UiProvider` is the only provider an app mounts. The theme is fixed: `src/theme/tokens.ts` holds a
light and a dark scheme, and `UiProvider` resolves them into the `--dw-*` custom properties
stylesheets read. The app renders the light one, the only scheme designed so far, whatever the
system prefers; `colorScheme` pins either, which is how Storybook shows the dark one.

Tokens come in two kinds, both in `tokens.ts`: **scheme** tokens each scheme defines its own value
for, and **fixed** tokens, the same in both.

## Stylesheets

Components style themselves in CSS modules, reading `--dw-*`. Loops over sizes or tones use `@each`
from [`@diwire/postcss-config`](../postcss-config), which a consuming app must load for these
stylesheets to compile.

## Stories

`pnpm storybook` serves the component catalogue at http://localhost:6006. The toolbar switches the
colour scheme through `UiProvider`, so every story can be read in both.
