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

## Signing in

Supabase Auth signs a user in and the web app sends the access token it gets as
`Authorization: Bearer`. A route that needs a user mounts `requireUser` from `src/auth`, which
verifies the token against the project's public signing keys and leaves its claims in `jwtPayload`;
`GET /api/account` is the first. The keys come from the project named by `SUPABASE_URL`, which the
Edge runtime sets itself and `pnpm dev` reads from `.env.development`.

## Database

A route reads and writes Postgres through PostgREST as the user who called it: `databaseOf` in
`src/database` builds a client that forwards the request's access token, so row level security
decides what the request reaches and no route holds a key that bypasses it. The client needs the
project's publishable key, which the Edge runtime provides as `SUPABASE_PUBLISHABLE_KEYS` and
`pnpm dev` reads from `.env.development`.

An owner shares a project by email through the `share_project` function, the one place that reads
`auth.users`; it answers the same whether or not the email has an account. The invitee's row in
`project_shares` starts `pending`, which shows them the project's name only, and reaches the floors
and their plan images once `accepted`. Deleting a project and sharing it stay with the owner.

The schema lives in `supabase/migrations`, and `src/database/schema.ts` mirrors it for the types a
query returns: a migration that changes a table changes that file with it. Plan images sit in the
private `plans` storage bucket, each under a folder named after its owner's id; the web app uploads
and reads them directly.

## Supabase

The Supabase CLI is a dev dependency; run it with `pnpm exec supabase` from this folder.

`supabase/config.toml` is the hosted project's configuration: who may sign in and how, and where
Auth may send a user back to. It declares only what differs from the defaults.

- **Locally**, with Docker running: `pnpm build`, then `pnpm exec supabase start` serves the
  function at `http://127.0.0.1:54321/functions/v1/api`.
- **Deploying** happens on every merge to `main`, in
  [the deploy workflow](../../.github/workflows/deploy.yml): it pushes `config.toml` to the project,
  applies the migrations not yet applied, then deploys the function. It names the project and reads
  `SUPABASE_ACCESS_TOKEN` and `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` from the repository's secrets.
  By hand, with the same variables exported: `pnpm config:push`,
  `pnpm db:push --remote=<project ref>`, then `pnpm build` and `pnpm functions:deploy`.

The gateway does not verify a JWT for this function (`verify_jwt = false`): the app decides per
route who may call it.
