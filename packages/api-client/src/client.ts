import { hc } from "hono/client";
import type { AppType } from "server";

export type ApiClient = ReturnType<typeof hc<AppType>>;

export interface CreateApiClientOptions {
	/** Server origin, e.g. http://localhost:3001 */
	baseUrl: string;
	/** Extra headers per request; may be async (e.g. forwarding cookies from a Next server component). */
	headers?: () => Record<string, string> | Promise<Record<string, string>>;
	/** Cookie handling. Browsers use "include"; React Native sets the cookie header itself and uses "omit". */
	credentials?: RequestCredentials;
	fetch?: typeof fetch;
}

export function createApiClient({
	baseUrl,
	headers,
	credentials = "include",
	fetch,
}: CreateApiClientOptions): ApiClient {
	return hc<AppType>(baseUrl, { headers, fetch, init: { credentials } });
}
