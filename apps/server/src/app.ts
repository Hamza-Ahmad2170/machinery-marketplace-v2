import type { ApiErrorStatus, ProblemDetails } from "@repo/validators";
import { Hono } from "hono";
import type { ApplyGlobalResponse } from "hono/client";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./auth";
import { env } from "./env";
import { handleError, handleNotFound } from "./lib/errors";
import { listingRoutes } from "./routes/listings";
import { meRoutes } from "./routes/me";
import type { AppEnv } from "./types";

export const app = new Hono<AppEnv>()
	.basePath("/api")
	.use(logger())
	.use(
		cors({
			origin: env.CORS_ORIGINS,
			credentials: true,
			allowHeaders: ["Content-Type", "Authorization"],
			allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		}),
	)
	.on(["GET", "POST"], "/auth/*", (c) => auth.handler(c.req.raw))
	.use(async (c, next) => {
		const result = await auth.api.getSession({ headers: c.req.raw.headers });
		c.set("user", result?.user ?? null);
		c.set("session", result?.session ?? null);
		await next();
	})
	.get("/health", (c) => c.json({ ok: true }, 200))
	.route("/me", meRoutes)
	.route("/listings", listingRoutes)
	.onError(handleError)
	.notFound(handleNotFound);

/** Every route can fail with any ApiError status, always as a ProblemDetails body. */
type ErrorResponses = { [S in ApiErrorStatus]: { json: ProblemDetails } };

/** Imported (type-only) by @repo/api-client for the Hono RPC client. */
export type AppType = ApplyGlobalResponse<typeof app, ErrorResponses>;
