# Server (Hono API)

This is the only app that talks to the database. Web, admin and mobile call this API through `@repo/api-client`, the typed Hono RPC client, and never import `@repo/db`. Biome reports an error if anything outside `apps/server` and `packages/db` imports it.

## Layout

```
src/
├── index.ts         Starts the Node server. Nothing else.
├── app.ts           Global middleware. Mounts every module. Exports AppType.
├── types.ts         Hono context types (AppEnv, AuthedEnv).
├── config/          Settings only: plain values, no connections or instances.
│   ├── env.ts       The only file that reads process.env.
│   └── cors.ts      Origins, headers and methods for browser clients.
├── lib/             Shared instances and helpers with no business rules.
│   ├── auth.ts      Better Auth instance.
│   ├── errors.ts    ApiError, the global error and not-found handlers, ErrorResponses.
│   └── validator.ts validator(target, schema): Zod validation that throws ApiError.
├── middleware/      Hono middleware (requireAuth, later requireRole).
└── modules/<feature>/
    ├── <feature>.routes.ts         Mounted at /api/<feature>
    ├── <feature>.admin.routes.ts   Mounted at /api/admin/<feature>
    ├── <feature>.service.ts        Business rules
    ├── <feature>.queries.ts        Drizzle queries
    └── <feature>.test.ts
```

Folders are plural feature names (`listings`, `categories`). Create only the files a module needs. A module that doesn't touch the database, like `users` today, has only a routes file.

## Layers

`routes → service → queries → db`

- **Routes.** Each route file defines paths, applies auth middleware, validates input with `validator()` from `#lib/validator.js`, calls the service, and returns `c.json(data, status)` with an explicit status. Write handlers inline in the chain so Hono RPC can infer types. Route files don't import `db` and don't hold business rules.
- **Service.** Plain exported functions for business rules: ownership, status changes and limits. They throw errors with stable codes and open transactions. They never take Hono's `c`, only plain values such as `userId` and the input.
- **Queries.** Drizzle only. The first argument is `db: DbOrTx` from `@repo/db/client`, so a service can pass a transaction. Select only the columns the caller needs, and never return password or token columns. Queries make no decisions.

Import sibling layers as namespaces: `import * as listingsQueries from "./listings.queries.js"`.

## Rules between modules

- A module may call another module's service. It never calls another module's queries or routes.
- Request schemas (bodies, filters, pagination) go in `@repo/validators`, so the clients reuse them for forms. Schemas only the server uses stay in the module.
- Clients infer response types through Hono RPC. Don't create shared response types.
- Tables go in `packages/db/src/schema/<feature>.ts` and are exported from `schema/index.ts`. Relations go in `packages/db/src/relations.ts`.

## Responses and errors

- **Success:** return the data itself with `c.json(data, status)`. Don't wrap it in `{ success, data }` and don't add a response class. Hono RPC infers the type, and `res.ok` already says whether the call succeeded. Lists return an object such as `{ items, nextCursor }`, never a bare array, so fields can be added later.
- **Failure:** throw `ApiError`, the one error class. Don't return error JSON from a handler.
  - `throw ApiError.notFound("Listing not found")`
  - `throw ApiError.forbidden("Only the seller can edit this listing")`
  - `throw new ApiError(409, "Already saved", { code: "CONFLICT" })`
- **`detail`** is shown to users, so keep it plain and never put internal information in it.
- **Error codes:** clients branch on `code`. To give an error its own code, such as `LISTING_NOT_FOUND`, add it to `errorCodes` in `packages/validators/src/problem.ts`.
- **What `handleError` in `app.ts` returns:**

  | Thrown                                             | Response                                                                     |
  | -------------------------------------------------- | ---------------------------------------------------------------------------- |
  | `ApiError`                                         | its status as an RFC 9457 `application/problem+json` body (`ProblemDetails`) |
  | Hono `HTTPException` (malformed JSON, body limit…) | same body; the status is mapped onto the declared list                       |
  | Anything else                                      | logged, then a generic 500 that never includes the original message          |

  Unknown routes get a 404 in the same format.
- **Validation:** `validator(target, schema)` returns 422 with `fieldErrors` keyed by dotted path, for example `{ "items.0.price": ["..."] }`. Clients show these next to form fields.
- **Statuses:** `apiErrorStatuses` in `@repo/validators` lists every status an error can have. `AppType` is wrapped in `ApplyGlobalResponse` with `ErrorResponses`, so every route's RPC type includes those statuses with a `ProblemDetails` body. Add a status to the list before throwing it. Statuses not on the list are reported as 400, or as 500 for 5xx.
- **Better Auth:** routes under `/api/auth/*` return Better Auth's own error format. Clients handle those through the Better Auth client.

## Mounting

`app.ts` mounts every module at `/api/<feature>`. Keep the `.route()` calls chained so AppType includes them. Admin routes go in one `/admin` sub-app, which applies the role check once for all of them.

## Config folder

- `config/env.ts` holds values that change per deployment: URLs, secrets, ports. t3-env validates them.
- `config/<area>.ts` holds app-wide settings grouped by area: `cors.ts` today, and later `pagination.ts` for page sizes and `uploads.ts` for file size and photo limits. Middleware options belong here too. The middleware call itself stays in `app.ts`, for example `.use(cors(corsOptions))`. Add a file when the first value for that area is needed. These files may import `env` for derived values.
- Config files export plain values only. Anything that opens a connection or holds state goes in `lib/`, never in `config/`. That covers Better Auth and mail or storage clients. The db client lives in `@repo/db`.
- A constant used by only one module stays in that module.

## Imports

- Import other server folders with a `#` subpath import, which points at `src/`: `#lib/errors.js` is `src/lib/errors.js`. It's set in the `imports` field of package.json (`"#*": "./src/*"`). Example: `import { requireAuth } from "#middleware/require-auth.js"`.
- Don't use a `#/` prefix. esbuild-based tools, including Hono CLI, reject it.
- Use `./` only for files in the same folder. Biome reports `../` imports as errors.
- Imports end in `.js`, because TypeScript uses NodeNext.
- Don't add tsconfig `paths` aliases. Web, admin and mobile typecheck this source when they import AppType, and `paths` would resolve with their tsconfig instead of this one. `#` imports resolve from this package's own package.json, so they work in every app. Client apps use `@/` for their own aliases, never `#`, so they can't shadow these.

## Where types live

There is no `types/` folder. Each type lives next to what it describes, and most are inferred:

- **Request inputs:** `z.infer` in `@repo/validators`, for example `CreateListingInput`.
- **Table rows:** `$inferSelect` and `$inferInsert`, exported next to the table in `packages/db/src/schema/<feature>.ts`.
- **User and session:** inferred in `lib/auth.ts`.
- **Hono context** (`AppEnv`, `AuthedEnv`): `src/types.ts`. Keep only context types there.
- **Types used by one module:** in the module file that owns them. Add `<feature>.types.ts` only if a module has many.
- **Responses:** clients infer them through Hono RPC. Don't write response types by hand.

## Better Auth

After adding or changing a Better Auth plugin, run `pnpm --filter server auth:generate`, then `pnpm db:generate`.

## Testing with Hono CLI

Hono CLI (`@hono/cli`) sends requests to the app in-process with `app.request()`. No server needs to run.

- List routes: `pnpm exec hono routes -e pg src/app.ts`
- Run a flow: `pnpm exec hono batch - -e pg src/app.ts`, with one JSON request per line on stdin. Each line can `expect` a status and a partial body. Cookies carry over to later lines, so a sign-in line signs in the lines after it.
- Always pass `src/app.ts`, whose default export is the app. `src/index.ts` would start a real server.
- Always pass `-e pg`. `pg` is a CommonJS package the CLI can't bundle.
- The app validates env vars when it loads. To test against the database, load `.env` with `pnpm exec dotenv -e .env -- hono ...`. Routes that don't touch the database also work with placeholder values in the environment.
- For auth flows, send `-H 'Origin: http://localhost:3000'` the way a browser would. Better Auth rejects untrusted origins with `403 INVALID_ORIGIN`.
- In Git Bash on Windows, put `MSYS_NO_PATHCONV=1` before `hono request`. Otherwise Git Bash rewrites `/api/...` into a Windows path. `hono batch` isn't affected, because its paths come from stdin.
