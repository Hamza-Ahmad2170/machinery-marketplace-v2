import type { CreateListingInput } from "@repo/validators";
import { mutationOptions, queryOptions } from "@tanstack/react-query";
import type { ApiClient } from "../client";
import { unwrap } from "../errors";

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
				queryFn: () => unwrap(api.api.listings.$get()),
			}),
		detail: (id: string) =>
			queryOptions({
				queryKey: listingKeys.detail(id),
				queryFn: () => unwrap(api.api.listings[":id"].$get({ param: { id } })),
			}),
		create: () =>
			mutationOptions({
				mutationKey: [...listingKeys.all, "create"],
				mutationFn: (input: CreateListingInput) => unwrap(api.api.listings.$post({ json: input })),
			}),
	};
}
