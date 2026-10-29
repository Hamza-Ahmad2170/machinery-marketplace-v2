import { queryOptions } from "@tanstack/react-query";
import { parseResponse } from "hono/client";
import type { ApiClient } from "../client";

export const meKeys = {
	all: ["me"] as const,
};

export function createMeQueries(api: ApiClient) {
	return {
		get: () =>
			queryOptions({
				queryKey: meKeys.all,
				queryFn: () => parseResponse(api.api.me.$get()),
			}),
	};
}
