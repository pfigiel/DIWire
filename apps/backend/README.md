# @diwire/backend

The API: [Hono](https://hono.dev), deployed as a single Supabase Edge Function named `api`.

`src/app.ts` is the app. Two entries serve it:

| Entry                             | Runs on                  | Serves the app through        |
| --------------------------------- | ------------------------ | ----------------------------- |
| `src/main.ts`                     | Node, `pnpm dev` locally | `@hono/node-server` on `PORT` |
| `supabase/functions/api/index.ts` | Supabase's Deno runtime  | `Deno.serve`, from the bundle |

Every route sits under `/api`, because Supabase keeps the function's name on the path, so a route
has one path everywhere: `http://localhost:3000/api/health` locally,
`<project>.supabase.co/functions/v1/api/health` deployed.

## Build

`pnpm build` bundles `src/app.ts` with esbuild into `supabase/functions/api/app.js` (gitignored),
which the function imports. Bundling lets the source use the workspace's packages and TypeScript
setup instead of Deno's import maps.

## Supabase

The Supabase CLI is a dev dependency; run it with `pnpm exec supabase` from this folder.

- **Locally**, with Docker running: `pnpm build`, then `pnpm exec supabase start` serves the
  function at `http://127.0.0.1:54321/functions/v1/api`.
- **Deploying** happens on every merge to `main`, in
  [the deploy workflow](../../.github/workflows/deploy.yml), which names the project it deploys to
  and reads `SUPABASE_ACCESS_TOKEN` from the repository's secrets. By hand, with the same two
  variables exported: `pnpm build`, then `pnpm functions:deploy`.

The gateway does not verify a JWT for this function (`verify_jwt = false` in
`supabase/config.toml`): the app decides per route who may call it.
