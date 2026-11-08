import "server-only";
import { createAuthClient } from "better-auth/client";
import { cookies } from "next/headers";
import { cache } from "react";
import { env } from "@/env";

// The framework-free client: the React one carries hooks that Server Components can't use.
// The default fetch plugins handle browser redirects, which don't apply on the server.
const authServerClient = createAuthClient({
	baseURL: env.NEXT_PUBLIC_API_URL,
	disableDefaultFetchPlugins: true,
});

/**
 * The visitor's session in Server Components, Server Functions and Route Handlers, or null when signed out.
 * It asks the API with the visitor's cookies, once per request however many components call it.
 * Like `serverApi`, it makes the route render per request.
 */
export const getSession = cache(async () => {
	const { data, error } = await authServerClient.getSession({
		fetchOptions: { headers: { cookie: (await cookies()).toString() } },
	});
	// Signed out is `data: null` with no error. An error means the API couldn't answer, so don't treat it as signed out.
	if (error) {
		throw new Error(`Couldn't load the session (${error.status} ${error.statusText})`);
	}
	return data;
});
