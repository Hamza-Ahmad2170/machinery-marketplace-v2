import { createMiddleware } from "hono/factory";
import { HTTPException } from "hono/http-exception";
import type { AuthedEnv } from "../types";

/** Rejects unauthenticated requests and narrows `user` / `session` to non-null. */
export const requireAuth = createMiddleware<AuthedEnv>(async (c, next) => {
	if (!c.get("user")) {
		throw new HTTPException(401, { message: "Unauthorized" });
	}
	await next();
});
