import "server-only";
import { createApiClient, createQueries, makeQueryClient } from "@repo/api-client";
import { cookies } from "next/headers";
import { cache } from "react";
import { env } from "~/env";

/** One QueryClient per request, shared by every server component that prefetches. */
export const getQueryClient = cache(makeQueryClient);

/** Server client: forwards the incoming request's cookies so the API sees the same session. */
export const getServerQueries = cache(() =>
	createQueries(
		createApiClient({
			baseUrl: env.API_URL ?? env.NEXT_PUBLIC_API_URL,
			credentials: "omit",
			headers: async () => ({ cookie: (await cookies()).toString() }),
		}),
	),
);
