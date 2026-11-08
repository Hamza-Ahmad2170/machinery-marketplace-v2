import { Hono } from "hono";
import type { ApplyGlobalResponse } from "hono/client";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { corsOptions } from "#config/cors.js";
import { auth } from "#lib/auth.js";
import { type ErrorResponses, handleError, handleNotFound } from "#lib/errors.js";
import { usersRoutes } from "#modules/users/users.routes.js";
import type { AppEnv } from "./types.js";

export const app = new Hono<AppEnv>()
	.basePath("/api")
	.use(logger())
	.use(cors(corsOptions))
	// Health stays ahead of the session lookup so it works without the database.
	.get("/health", (c) => c.json({ ok: true }, 200))
	.on(["GET", "POST"], "/auth/*", (c) => auth.handler(c.req.raw))
	.use(async (c, next) => {
		const result = await auth.api.getSession({ headers: c.req.raw.headers });
		c.set("user", result?.user ?? null);
		c.set("session", result?.session ?? null);
		await next();
	})
	// Modules: each one is mounted at /api/<feature>. Keep the calls chained so AppType sees them.
	.route("/users", usersRoutes)
	.onError(handleError)
	.notFound(handleNotFound);

/**
 * Imported type-only by frontends for the Hono RPC client.
 * Every route can also fail with any ApiError status, always with a ProblemDetails body.
 */
export type AppType = ApplyGlobalResponse<typeof app, ErrorResponses>;

/** Default export for Hono CLI (`hono routes`, `hono batch`). index.ts uses the named export. */
export default app;
