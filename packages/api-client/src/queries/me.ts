import { queryOptions } from "@tanstack/react-query";
import type { ApiClient } from "../client";
import { unwrap } from "../errors";

export const meKeys = {
	all: ["me"] as const,
};

export function createMeQueries(api: ApiClient) {
	return {
		get: () =>
			queryOptions({
				queryKey: meKeys.all,
				queryFn: () => unwrap(api.api.me.$get()),
			}),
	};
}
