import { zValidator } from "@hono/zod-validator";
import { db } from "@repo/db/client";
import { listing } from "@repo/db/schema";
import { createListingInput, listingId } from "@repo/validators";
import { Hono } from "hono";
import { requireAuth } from "../middleware/require-auth";
import type { AppEnv } from "../types";

const withOwner = { owner: { columns: { id: true, name: true } } } as const;

export const listingRoutes = new Hono<AppEnv>()
	.get("/", async (c) => {
		const rows = await db.query.listing.findMany({
			orderBy: { createdAt: "desc" },
			limit: 50,
			with: withOwner,
		});
		return c.json(rows);
	})
	.get("/:id", zValidator("param", listingId), async (c) => {
		const { id } = c.req.valid("param");
		const row = await db.query.listing.findFirst({ where: { id }, with: withOwner });
		if (!row) {
			return c.json({ message: "Listing not found" }, 404);
		}
		return c.json(row, 200);
	})
	.post("/", requireAuth, zValidator("json", createListingInput), async (c) => {
		const [row] = await db
			.insert(listing)
			.values({ ...c.req.valid("json"), ownerId: c.get("user").id })
			.returning();
		if (!row) {
			return c.json({ message: "Could not create listing" }, 500);
		}
		return c.json(row, 201);
	});
