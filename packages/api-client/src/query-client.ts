import { QueryClient } from "@tanstack/react-query";
import { DetailedError } from "hono/client";

function isClientError(error: unknown) {
	return (
		error instanceof DetailedError &&
		(error.statusCode ?? 0) >= 400 &&
		(error.statusCode ?? 0) < 500
	);
}

/** Shared defaults. Each app creates its own instance (per request on the Next server). */
export function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 30_000,
				// 4xx responses won't succeed on retry
				retry: (failureCount, error) => !isClientError(error) && failureCount < 2,
			},
		},
	});
}
