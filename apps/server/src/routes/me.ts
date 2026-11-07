import { Hono } from "hono";
import { requireAuth } from "../middleware/require-auth";
import type { AppEnv } from "../types";

export const meRoutes = new Hono<AppEnv>().get("/", requireAuth, (c) => {
	const user = c.get("user");
	return c.json(
		{ id: user.id, name: user.name, email: user.email, image: user.image ?? null },
		200,
	);
});
