import { createApiClient } from "@repo/api-client";
import { env } from "@/env";

/**
 * API client for Client Components. The browser attaches the session cookie itself.
 * In Server Components, Server Functions and Route Handlers, use `serverApi` from ./server instead.
 */
export const api = createApiClient(env.NEXT_PUBLIC_API_URL);
