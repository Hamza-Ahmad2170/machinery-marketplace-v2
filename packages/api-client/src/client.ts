import { type ClientRequestOptions, type ClientResponse, hc, parseResponse } from "hono/client";
import type { AppType } from "server";
import { toApiClientError } from "./errors.js";

const createRpcClient = (baseUrl: string, options?: ClientRequestOptions) =>
	hc<AppType>(baseUrl, options);

/** Every API route below /api. `api.users.me.$get()` sends GET /api/users/me. */
export type ApiClient = ReturnType<typeof createRpcClient>["api"];

/**
 * Creates the typed Hono RPC client for the API.
 *
 * `baseUrl` is the API origin, for example http://localhost:3001 (the server's BETTER_AUTH_URL).
 * Requests include cookies, so the Better Auth session also works from the web app's origin.
 */
export function createApiClient(baseUrl: string, options: ClientRequestOptions = {}): ApiClient {
	return createRpcClient(baseUrl, {
		...options,
		init: { credentials: "include", ...options.init },
	}).api;
}

/**
 * Awaits a client call and returns the parsed body of a successful response.
 * Throws ApiClientError for error statuses and network failures, which suits TanStack Query.
 *
 *   const me = await unwrap(api.users.me.$get());
 */
export async function unwrap<T extends ClientResponse<unknown>>(request: T | Promise<T>) {
	try {
		return await parseResponse(request);
	} catch (error) {
		// A cancelled request isn't an API failure. Let callers such as TanStack Query see the abort.
		if (error instanceof Error && error.name === "AbortError") {
			throw error;
		}
		throw toApiClientError(error);
	}
}
