"use client";

import { ApiClientError, unwrap } from "@repo/api-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { authClient } from "@/lib/auth/client";

export function SmokeClient({ initialSession }: { initialSession: typeof authClient.$Infer.Session | null }) {
	authClient.hydrateSession(initialSession);
	const { data, isPending, isRefetching } = authClient.useSession();
	const session = isPending && !isRefetching ? initialSession : data;
	const queryClient = useQueryClient();
	const health = useQuery({ queryKey: ["health"], queryFn: () => unwrap(api.health.$get()) });
	const me = useQuery({ queryKey: ["users", "me"], queryFn: () => unwrap(api.users.me.$get()) });
	const meError = me.error instanceof ApiClientError ? `${me.error.code} ${me.error.status}` : String(me.error);

	return (
		<div>
			<p id="client-session">{session ? session.user.email : "signed out"}</p>
			<p id="health">{health.status} {JSON.stringify(health.data)}</p>
			<p id="me">{me.status} {me.data ? me.data.email : meError}</p>
			<button
				type="button"
				id="sign-up"
				onClick={async () => {
					const email = `web-smoke-${Date.now()}@example.com`;
					await authClient.signUp.email({ email, password: crypto.randomUUID(), name: "Web Smoke" });
					await queryClient.invalidateQueries();
				}}
			>
				sign up
			</button>
			<button
				type="button"
				id="sign-out"
				onClick={async () => {
					await authClient.signOut();
					queryClient.clear();
				}}
			>
				sign out
			</button>
		</div>
	);
}
