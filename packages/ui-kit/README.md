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

`UiProvider` is the only provider an app mounts. The theme is fixed: `src/theme/tokens.ts` holds
every token, and `UiProvider` resolves them into the `--dw-*` custom properties stylesheets read.
There is one colour scheme, light, whatever the system prefers.

## Stylesheets

Components style themselves in CSS modules, reading `--dw-*`. Loops over sizes or tones use `@each`
from [`@diwire/postcss-config`](../postcss-config), which a consuming app must load for these
stylesheets to compile.

## Stories

`pnpm storybook` serves the component catalogue at http://localhost:6006.
