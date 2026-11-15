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
  function at `http://127.0.0.1:54321/functions/v1/api`. The gateway verifies a JWT, so send
  `Authorization: Bearer <ANON_KEY>` from the `start` output.
- **Deploying**: `pnpm exec supabase link --project-ref <ref>` once, then `pnpm build` and
  `pnpm functions:deploy`.
