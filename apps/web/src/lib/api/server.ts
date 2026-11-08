import "server-only";
import { createApiClient } from "@repo/api-client";
import { cookies } from "next/headers";
import { env } from "@/env";

/**
 * API client for Server Components, Server Functions and Route Handlers.
 * It forwards the visitor's cookies so the API sees their session.
 * Reading cookies makes the route render per request instead of at build time.
 */
export const serverApi = createApiClient(env.NEXT_PUBLIC_API_URL, {
	headers: async () => ({ cookie: (await cookies()).toString() }),
});
