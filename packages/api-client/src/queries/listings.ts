import type { CreateListingInput } from "@repo/validators";
import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { parseResponse } from "hono/client";
import type { ApiClient } from "../client";

export const listingKeys = {
	all: ["listings"] as const,
	list: () => [...listingKeys.all, "list"] as const,
	detail: (id: string) => [...listingKeys.all, "detail", id] as const,
};

export function createListingQueries(api: ApiClient) {
	return {
		list: () =>
			queryOptions({
				queryKey: listingKeys.list(),
				queryFn: () => parseResponse(api.api.listings.$get()),
			}),
		detail: (id: string) =>
			queryOptions({
				queryKey: listingKeys.detail(id),
				queryFn: () => parseResponse(api.api.listings[":id"].$get({ param: { id } })),
			}),
		create: () =>
			mutationOptions({
				mutationKey: [...listingKeys.all, "create"],
				mutationFn: (input: CreateListingInput) =>
					parseResponse(api.api.listings.$post({ json: input })),
			}),
	};
}
