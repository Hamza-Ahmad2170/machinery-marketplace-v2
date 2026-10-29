"use client";

import { Button } from "@repo/ui/components/button";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { authClient } from "~/lib/auth-client";

export function SessionBar() {
	const { data: session, isPending } = authClient.useSession();
	const queryClient = useQueryClient();

	return (
		<header className="flex items-center justify-between">
			<h1 className="text-xl font-semibold">Machinery Marketplace</h1>
			{isPending ? null : session ? (
				<div className="flex items-center gap-3 text-sm">
					<span className="text-muted-foreground">{session.user.email}</span>
					<Button
						variant="outline"
						size="sm"
						onClick={async () => {
							await authClient.signOut();
							queryClient.clear();
						}}
					>
						Sign out
					</Button>
				</div>
			) : (
				<Button size="sm" nativeButton={false} render={<Link href="/sign-in" />}>
					Sign in
				</Button>
			)}
		</header>
	);
}
