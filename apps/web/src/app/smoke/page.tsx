import { unwrap } from "@repo/api-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { serverApi } from "@/lib/api/server";
import { getSession } from "@/lib/auth/server";
import { getQueryClient } from "@/lib/query-client";
import { SmokeClient } from "./smoke-client";

export default async function SmokePage() {
	const session = await getSession();
	const queryClient = getQueryClient();
	await queryClient.prefetchQuery({ queryKey: ["health"], queryFn: () => unwrap(serverApi.health.$get()) });
	if (session) {
		await queryClient.prefetchQuery({ queryKey: ["users", "me"], queryFn: () => unwrap(serverApi.users.me.$get()) });
	}
	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<p id="server-session">{session ? session.user.email : "signed out"}</p>
			<SmokeClient initialSession={session} />
		</HydrationBoundary>
	);
}
