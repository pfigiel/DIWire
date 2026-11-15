# @diwire/postcss-config

The shared PostCSS plugin list — currently `postcss-each`, which expands the loops ui-kit's
stylesheets use.

```ts
// postcss.config.ts
import config from '@diwire/postcss-config'

export default config
```

Every package whose stylesheets are compiled needs that file, **including apps that only consume
ui-kit**. Vite resolves PostCSS once per project root, so ui-kit's CSS is processed by whichever app
builds it, not by ui-kit's own config — an app without this loads ui-kit's `@each` as invalid CSS.

## Cascade layers

The list ends with `layerPackageStyles`, which wraps the `*.module.css` files of each package it
names in a cascade layer of that name — ui-kit's component styles land in `@layer ui-kit`. An app's
own stylesheets stay unlayered, and unlayered rules outrank every layer, so a call site overrides a
component without raising specificity or hoping the bundler emits its file last.

The plugin spells those names out rather than reading them off the path, because the order they sort
in is declared separately in CSS. A package layered without being declared would sort last, above
ui-kit instead of below the app, so the two lists are added to together.

`@diwire/ui-kit` loads Mantine through `styles.layer.css` and declares the order in `globals.css`:

```css
@layer mantine, ui-kit;
```

Mantine first, then ui-kit, then everything an app writes. Two stylesheets deliberately stay out:

- `globals.css`, because it has to outrank the theme Mantine injects at runtime, which is unlayered.
- `*.stories.module.css`, because a story stands in for a call site and must override the component
  it is showing.
