import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { auth } from "./auth";
import { env } from "./env";
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
	.get("/health", (c) => c.json({ ok: true }))
	.route("/me", meRoutes)
	.route("/listings", listingRoutes)
	.onError((err, c) => {
		if (err instanceof HTTPException) {
			return c.json({ message: err.message }, err.status);
		}
		console.error(err);
		return c.json({ message: "Internal Server Error" }, 500);
	});

/** Imported (type-only) by @repo/api-client for the Hono RPC client. */
export type AppType = typeof app;
