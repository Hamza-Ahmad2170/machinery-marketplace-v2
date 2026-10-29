import { z } from "zod";

export const listingId = z.object({ id: z.uuid() });

export const createListingInput = z.object({
	title: z.string().trim().min(3).max(120),
	description: z.string().trim().max(5000).optional(),
	priceCents: z.int().nonnegative(),
});
export type CreateListingInput = z.infer<typeof createListingInput>;
