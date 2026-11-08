import { createMiddleware } from "hono/factory";
import { ApiError } from "#lib/errors.js";
import type { AuthedEnv } from "#types.js";

export const requireAuth = createMiddleware<AuthedEnv>(async (c, next) => {
	if (!c.get("user")) {
		throw ApiError.unauthorized();
	}
	await next();
});
