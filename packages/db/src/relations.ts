import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";
import { authRelations } from "./schema/auth";

const appRelations = defineRelations(schema, (r) => ({
	listing: {
		owner: r.one.user({
			from: r.listing.ownerId,
			to: r.user.id,
		}),
	},
}));

// Generated auth relations are a partial and must be spread after the full definition.
export const relations = { ...appRelations, ...authRelations };
