# Web (Next.js)

The public marketplace site: Next.js 16 with the App Router and Turbopack. It never touches the database. Data comes from the API in `apps/server` through `@repo/api-client`.

## Layout

```
src/
├── app/             Routes. layout.tsx loads @repo/ui/globals.css, the fonts and the theme.
├── components/      Components only this app uses.
├── lib/api/
│   ├── client.ts    `api` for Client Components.
│   └── server.ts    `serverApi` for Server Components, Server Functions and Route Handlers.
└── env.ts           The only file that reads process.env (t3-env).
```

## Imports

- `@/` points at `src/`, for example `@/lib/api/client`.
- Shared UI comes from `@repo/ui`: `@repo/ui/components/button`, `@repo/ui/lib/utils`.
- Don't add more tsconfig `paths`. They also apply to the server and package source this app typechecks through AppType.

## Calling the API

- In Client Components, use `api` from `@/lib/api/client`. In Server Components, Server Functions and Route Handlers, use `serverApi` from `@/lib/api/server`. Both have the same routes: `api.users.me.$get()` sends `GET /api/users/me`.
- Wrap calls in `unwrap()` from `@repo/api-client`. It returns the typed body of a successful response and throws `ApiClientError` otherwise:

  ```ts
  const me = await unwrap(api.users.me.$get());
  ```

- `ApiClientError` has:
  - `code`: the server's error codes, plus `NETWORK_ERROR` (no response) and `UNEXPECTED_RESPONSE` (not a ProblemDetails body, such as a proxy error page). Branch on this.
  - `status`: the HTTP status, or 0 when no response arrived.
  - `message`: safe to show to users.
  - `fieldErrors`: validation messages keyed by dotted path, for showing next to form fields.
- Response types come from the server through Hono RPC. Don't write them by hand. If you need a named type, use `InferResponseType` from `hono/client`.
- `serverApi` forwards the visitor's cookies, so any route that uses it renders per request instead of at build time.
- `/api/auth/*` belongs to Better Auth. Use the Better Auth client for sign-in, sign-up and sign-out, not `api`. The Better Auth client isn't added yet.

## Components (shadcn/ui)

- shadcn/ui 4 with Base UI primitives, the `base-nova` style, the `neutral` base color and lucide icons.
- Shared components live in `packages/ui` so the admin app can reuse them. Edit them there freely. They're our code, not a dependency.
- To add one, run this from the repo root: `pnpm dlx shadcn@latest add <component> -c apps/web`. Primitives such as button or dialog go to `packages/ui/src/components`. Blocks built from them, such as `login-01`, go to `apps/web/src/components`.
- After adding, run `pnpm lint:fix`. The CLI writes its own formatting.
- The CLI can add a dependency to `apps/web/package.json` that only `packages/ui` imports. Adding button added `cn`. Remove it if web doesn't import it.
- Theme colors and radius are CSS variables in `packages/ui/src/styles/globals.css`. Both `components.json` files must keep the same `style`, `baseColor` and `iconLibrary`.
- Dark mode: next-themes sets the `dark` class on `<html>` and follows the system setting by default.

## Environment

- Copy `.env.example` to `.env`.
- `NEXT_PUBLIC_*` values are inlined at build time, so changing one needs a rebuild. Turbo includes them in the build cache key.
- Add every new variable to `src/env.ts`, and read it through `env`, never `process.env`.

## Checks

- `pnpm --filter web typecheck` runs `next typegen` first, which writes the route types and `next-env.d.ts`. `next-env.d.ts` is generated and gitignored.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
