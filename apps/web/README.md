# @diwire/web

The Diwire application: Vite, React, TanStack Router and Query, with every component coming from
[`@diwire/ui-kit`](../../packages/ui-kit).

Setup and commands are in the [workspace README](../../README.md); where a new file goes is in
[AGENTS.md](../../AGENTS.md#app-structure).

## Layout

| Path                     | What lives there                                                      |
| ------------------------ | --------------------------------------------------------------------- |
| `src/routes`             | Routing only — a path, its params, what loads before a screen renders |
| `src/locales`            | Merges each domain's catalogs into one per locale                     |
| `src/App.tsx`            | The providers every screen sits inside                                |
| `src/routing/router.tsx` | The router                                                            |

A domain gets its own top-level folder as it arrives, with its screens, data access, rules and
message catalogs together.

## Routing

`src/routing/routeTree.gen.ts` is generated from `src/routes` and committed, so a fresh clone
typechecks before Vite has run — never edit it. `src/routing/router-register.d.ts` is what makes
`<Link to>` reject a path that does not exist.

## Translations

User-facing text comes from `<domain>/locales/<locale>.json` through `t()`. Keys are typed, so a
missing one fails `type:check` instead of rendering itself. Polish is the only locale for now;
another is a `<domain>/locales/<locale>.json` per domain plus its entry in `src/locales/catalogs.ts`
and `src/i18n.ts`.

## Deploying

Every merge to `main` builds the app and deploys it to Vercel, in
[the deploy workflow](../../.github/workflows/deploy.yml), which names the Vercel project and reads
`VERCEL_TOKEN` from the repository's secrets. [`vercel.json`](vercel.json) holds the project's
settings: every path serves `index.html` so the router can answer it, and Vercel's own Git
deployments are off so the workflow is the only thing that deploys.
