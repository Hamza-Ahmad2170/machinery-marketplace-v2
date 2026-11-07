# Machinery Marketplace

Turborepo + pnpm monorepo: Next.js web app, Hono API server, Drizzle (Postgres), Better Auth, Zod, TanStack Query, t3-env, Biome.

## Layout

```
apps/
  server/       Hono API: routes, middleware, Better Auth config (src/auth.ts), env.
                The only app that talks to the database. Exports `AppType` for RPC.
  web/          Next.js (App Router) — talks to the server over Hono RPC
  admin/        (planned) Next.js — reuses @repo/api-client and @repo/ui
  mobile/       (planned) Expo — reuses @repo/api-client and @repo/validators
packages/
  db/           @repo/db — Drizzle schema (incl. generated auth tables), relations, client, migrations
  api-client/   @repo/api-client — RPC client factory + TanStack Query options for every app
  validators/   @repo/validators — Zod schemas shared by API input and client forms
  ui/           @repo/ui — shadcn components + Tailwind v4 theme for web and admin
tooling/
  typescript/   @repo/tsconfig — base, node, react, nextjs configs
```

Same split as production Hono + Drizzle monorepos such as midday and openstatus: the server app owns
its routes and auth config, the database is a package (so seed scripts or a future worker can use it),
and frontends import the server's type only.

Apps have plain names (`web`, `server`), packages use the `@repo/` scope: `pnpm --filter server dev`.

## Getting started

Requires Node 24 and pnpm 11.

```bash
pnpm install
cp apps/server/.env.example apps/server/.env    # fill DATABASE_URL + BETTER_AUTH_SECRET
cp apps/web/.env.example apps/web/.env
pnpm db:migrate                                 # drizzle-kit reads apps/server/.env
pnpm dev                                        # web on :3000, server on :3001
```

## Scripts

| Command              | What it does                                                                 |
| -------------------- | ---------------------------------------------------------------------------- |
| `pnpm dev`           | Next on :3000 and the server (tsx watch) on :3001                            |
| `pnpm build`         | Builds every app (`apps/server` bundles to `dist/` with tsdown)              |
| `pnpm typecheck`     | `tsc` in every package                                                       |
| `pnpm lint`          | Biome check across the repo (`pnpm lint:fix` to apply fixes)                 |
| `pnpm db:generate`   | Create a migration from schema changes                                       |
| `pnpm db:migrate`    | Apply migrations                                                             |
| `pnpm db:studio`     | Drizzle Studio                                                               |
| `pnpm auth:generate` | Regenerate `packages/db/src/schema/auth.ts` after Better Auth plugin changes |

## Conventions

**Environment variables (t3-env).** `@repo/db` exports a `dbEnv()` slice; `apps/server/src/env.ts`
extends it and adds the auth/CORS variables. Each app owns its `.env` (no root `.env`); the db
scripts read `apps/server/.env`. New variables must also be listed under `build.env` in `turbo.json`
so cache hashes change with them. `SKIP_ENV_VALIDATION=1` skips validation (CI typecheck, Docker builds).

**API + RPC.** Routes live in `apps/server/src/routes` as chained Hono routers mounted in
`src/app.ts`, which exports `AppType`. `@repo/api-client` imports it type-only
(`import type { AppType } from "server"`), so no server code reaches the browser.

**Errors (RFC 9457).** Every API error is `application/problem+json` with the shape in
`packages/validators/src/problem.ts`: `{ type, title, status, detail?, instance?, code, fieldErrors? }`.
On the server:

- Throw `ApiError` (`apps/server/src/lib/errors.ts`), e.g. `throw ApiError.notFound("Listing not found")`.
  Anything else thrown becomes a 500 with a generic message; the real error is only logged.
- Validate with `validator("json", schema)` from `src/lib/validator.ts`, not `zValidator` directly.
  It throws a 422 with `fieldErrors` keyed by dotted path (`"items.0.price"`).
- Always pass the success status explicitly (`c.json(data, 200)`). Without it Hono types the
  response as "any status", and it would overlap with the error types.
- `AppType` wraps the app in `ApplyGlobalResponse`, so every route's RPC types include
  `ProblemDetails` for each status in `apiErrorStatuses`. Add a status there to use it in `ApiError`.

On clients, query and mutation functions call `unwrap(...)`, which returns the typed success body or
throws `ProblemError` (also for network failures, `code: "NETWORK_ERROR"`). It is registered as
TanStack Query's default error type, so `mutation.error?.fieldError("title")` is typed everywhere.
Better Auth's own `/api/auth/*` endpoints keep Better Auth's error format; use its client for those.

**Data fetching.** `@repo/api-client` shares query keys, `queryOptions` and `mutationOptions`,
not hooks. Each app calls `useQuery(queries.listings.list())` itself and owns its providers and
side effects (toasts, navigation, invalidation). The Next app prefetches the same options in
server components with a cookie-forwarding client (`apps/web/src/lib/api.server.ts`).

**Auth.** Better Auth is mounted on the server at `/api/auth/*`. Web uses cookies with
`credentials: "include"`. If web and server are on sibling subdomains in production, set
`COOKIE_DOMAIN` on the server so the web app's server components can forward the session.

**Adding mobile (Expo).** Add `@better-auth/expo` to the plugins in `apps/server/src/auth.ts` and the app scheme to
`CORS_ORIGINS`; in the app create the client with `createApiClient({ credentials: "omit",
headers: () => ({ cookie: authClient.getCookie() }) })`. Pin `react` in the pnpm catalog to the
version the Expo SDK requires.

**Example domain.** The `listing` table, routes, validators and UI exist to show the full
db → api → client flow. Replace them with the real model.
