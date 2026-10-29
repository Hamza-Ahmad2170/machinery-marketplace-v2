import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Listings } from "~/components/listings";
import { SessionBar } from "~/components/session-bar";
import { getQueryClient, getServerQueries } from "~/lib/api.server";

export default async function HomePage() {
	const queryClient = getQueryClient();
	await queryClient.prefetchQuery(getServerQueries().listings.list());

	return (
		<main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10">
			<SessionBar />
			<HydrationBoundary state={dehydrate(queryClient)}>
				<Listings />
			</HydrationBoundary>
		</main>
	);
}
