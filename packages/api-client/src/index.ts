import type { ApiClient } from "./client";
import { createListingQueries } from "./queries/listings";
import { createMeQueries } from "./queries/me";

export { type ApiClient, type CreateApiClientOptions, createApiClient } from "./client";
export { listingKeys } from "./queries/listings";
export { meKeys } from "./queries/me";
export { makeQueryClient } from "./query-client";

/** Query and mutation options bound to one API client. Apps call `useQuery(queries.listings.list())`. */
export function createQueries(api: ApiClient) {
	return {
		listings: createListingQueries(api),
		me: createMeQueries(api),
	};
}

export type Queries = ReturnType<typeof createQueries>;
