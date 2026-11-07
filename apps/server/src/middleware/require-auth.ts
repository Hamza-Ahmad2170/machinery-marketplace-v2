import { createMiddleware } from "hono/factory";
import { ApiError } from "../lib/errors";
import type { AuthedEnv } from "../types";

/** Rejects unauthenticated requests and narrows `user` / `session` to non-null. */
export const requireAuth = createMiddleware<AuthedEnv>(async (c, next) => {
	if (!c.get("user")) {
		throw ApiError.unauthorized();
	}
	await next();
});
