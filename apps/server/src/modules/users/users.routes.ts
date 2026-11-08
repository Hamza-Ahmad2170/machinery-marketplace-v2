import { Hono } from "hono";
import { requireAuth } from "#middleware/require-auth.js";
import type { AppEnv } from "#types.js";

export const usersRoutes = new Hono<AppEnv>().get("/me", requireAuth, (c) => {
	const user = c.get("user");
	return c.json(
		{ id: user.id, name: user.name, email: user.email, image: user.image ?? null },
		200,
	);
});
