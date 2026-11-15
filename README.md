# Diwire

A desktop-focused web app for planning electrical installations in houses.

One pnpm workspace run through turbo:

| Package                                              | What it is                                     |
| ---------------------------------------------------- | ---------------------------------------------- |
| [`apps/web`](apps/web)                               | The application — Vite, React, TanStack        |
| [`apps/backend`](apps/backend)                       | The API — Hono, deployed to Supabase           |
| [`packages/ui-kit`](packages/ui-kit)                 | Components and design tokens, built on Mantine |
| [`packages/eslint-config`](packages/eslint-config)   | Shared ESLint presets and rules of our own     |
| [`packages/postcss-config`](packages/postcss-config) | Shared PostCSS plugins                         |
| [`packages/tsconfig`](packages/tsconfig)             | Shared TypeScript presets                      |

Coding standards are in [AGENTS.md](AGENTS.md), which every coding agent loads automatically.

## Prerequisites

- [**nvm**](https://github.com/nvm-sh/nvm#installing-and-updating) — manages Node versions.
- [**Node**](https://nodejs.org) — the version in [`.nvmrc`](.nvmrc), which `nvm use` installs.
- [**pnpm**](https://pnpm.io/installation) — the version pinned as `packageManager` in
  [`package.json`](package.json).

## Getting started

1. `nvm use`
2. `pnpm install` — also installs the git hooks below.
3. `pnpm dev` — serves the app at http://localhost:5173 and the API at http://localhost:3000
   (`GET /api/health`).

## Commands

Every task runs through turbo, so it covers each package that defines it.

| Command                | What it does                                       |
| ---------------------- | -------------------------------------------------- |
| `pnpm dev`             | Runs each package's dev server                     |
| `pnpm build`           | Builds every package                               |
| `pnpm preview`         | Builds, then serves the build                      |
| `pnpm storybook`       | Serves the ui-kit stories at http://localhost:6006 |
| `pnpm storybook:build` | Builds the static Storybook                        |
| `pnpm lint`            | ESLint                                             |
| `pnpm lint:css`        | Stylelint over every CSS file                      |
| `pnpm type:check`      | `tsc --noEmit`                                     |
| `pnpm knip`            | Reports unused files, exports and dependencies     |
| `pnpm deps:audit`      | Fails on a high or critical advisory               |
| `pnpm format`          | Prettier, writing in place                         |

## What runs without you asking

- **On commit** — Prettier, Stylelint, ESLint, `type:check` and `knip` over what you staged.
- **On push** — `deps:audit`.
- **On a pull request, and on `main` after a merge** — Prettier, ESLint, Stylelint, `type:check`,
  `knip`, the build and the Storybook build, in [CI](.github/workflows/ci.yml).
- **On `main` after a merge** — the API deploys to Supabase, in
  [the deploy workflow](.github/workflows/deploy.yml).
