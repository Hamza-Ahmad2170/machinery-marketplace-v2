import { makeQueryClient } from "@repo/api-client";
import { environmentManager, type QueryClient } from "@tanstack/react-query";

let browserQueryClient: QueryClient | undefined;

/**
 * The QueryClient for where the code runs.
 * - Server: a new one on every call, so requests never share cached data.
 * - Browser: one for the whole visit. Making a new one would drop the cache, for example when React suspends during the first render.
 */
export function getQueryClient() {
	if (environmentManager.isServer()) {
		return makeQueryClient();
	}
	browserQueryClient ??= makeQueryClient();
	return browserQueryClient;
}
