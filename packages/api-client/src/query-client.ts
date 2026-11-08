import {
	defaultShouldDehydrateQuery,
	environmentManager,
	QueryClient,
} from "@tanstack/react-query";
import { ApiClientError } from "./errors.js";

/** A 4xx means the API rejected the request itself (signed out, forbidden, invalid). Sending it again won't help. */
function isRejected(error: unknown) {
	return error instanceof ApiClientError && error.status >= 400 && error.status < 500;
}

/**
 * Creates a QueryClient with the defaults every app shares.
 * Apps keep one per browser tab, and a server creates one per request.
 */
export function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				// Data rendered on the server stays fresh for a minute, so the browser doesn't fetch it again right after hydration.
				staleTime: 60 * 1000,
				// Retry network failures and 5xx up to 3 times. Never retry a 4xx, and never retry on the server, where it would hold up the page.
				retry: (failureCount, error) =>
					!environmentManager.isServer() && !isRejected(error) && failureCount < 3,
			},
			dehydrate: {
				// Also send queries that are still loading, so a Server Component can start a fetch without awaiting it and stream the result.
				shouldDehydrateQuery: (query) =>
					defaultShouldDehydrateQuery(query) || query.state.status === "pending",
				// Next.js detects dynamic pages through errors it throws, so they must pass through. Next.js redacts errors itself.
				shouldRedactErrors: () => false,
			},
		},
	});
}
