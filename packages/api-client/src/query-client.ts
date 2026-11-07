import { QueryClient } from "@tanstack/react-query";
import { ProblemError } from "./errors";

function isClientError(error: unknown) {
	return error instanceof ProblemError && error.status >= 400 && error.status < 500;
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
