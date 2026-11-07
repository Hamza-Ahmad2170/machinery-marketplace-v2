"use client";

import { listingKeys } from "@repo/api-client";
import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { createListingInput } from "@repo/validators";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { queries } from "~/lib/api";
import { authClient } from "~/lib/auth-client";

const price = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function Listings() {
	const { data: listings, isPending, error } = useQuery(queries.listings.list());
	const { data: session } = authClient.useSession();

	return (
		<section className="flex flex-col gap-4">
			{session ? <CreateListingForm /> : null}
			<h2 className="text-lg font-medium">Latest listings</h2>
			{isPending ? <p className="text-muted-foreground text-sm">Loading…</p> : null}
			{error ? <p className="text-destructive text-sm">{error.message}</p> : null}
			{listings?.length === 0 ? (
				<p className="text-muted-foreground text-sm">No listings yet.</p>
			) : null}
			<ul className="flex flex-col gap-3">
				{listings?.map((listing) => (
					<li key={listing.id}>
						<Card>
							<CardHeader>
								<CardTitle className="flex justify-between gap-4">
									<span>{listing.title}</span>
									<span>{price.format(listing.priceCents / 100)}</span>
								</CardTitle>
							</CardHeader>
							<CardContent className="text-muted-foreground text-sm">
								{listing.description ?? "No description"} · by {listing.owner?.name ?? "unknown"}
							</CardContent>
						</Card>
					</li>
				))}
			</ul>
		</section>
	);
}

function FieldError({ message }: { message: string | undefined }) {
	return message ? <p className="text-destructive text-sm">{message}</p> : null;
}

function CreateListingForm() {
	const queryClient = useQueryClient();
	const [formError, setFormError] = useState<string | null>(null);
	const create = useMutation({
		...queries.listings.create(),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: listingKeys.all }),
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle>New listing</CardTitle>
			</CardHeader>
			<CardContent>
				<form
					className="flex flex-col gap-3"
					onSubmit={(event) => {
						event.preventDefault();
						const form = event.currentTarget;
						const data = new FormData(form);
						const parsed = createListingInput.safeParse({
							title: data.get("title"),
							description: data.get("description") || undefined,
							priceCents: Math.round(Number(data.get("price")) * 100),
						});
						if (!parsed.success) {
							setFormError(parsed.error.issues[0]?.message ?? "Invalid input");
							return;
						}
						setFormError(null);
						create.mutate(parsed.data, { onSuccess: () => form.reset() });
					}}
				>
					<div className="grid gap-1.5">
						<Label htmlFor="title">Title</Label>
						<Input id="title" name="title" required />
						<FieldError message={create.error?.fieldError("title")} />
					</div>
					<div className="grid gap-1.5">
						<Label htmlFor="description">Description</Label>
						<Input id="description" name="description" />
						<FieldError message={create.error?.fieldError("description")} />
					</div>
					<div className="grid gap-1.5">
						<Label htmlFor="price">Price (USD)</Label>
						<Input id="price" name="price" type="number" min="0" step="0.01" required />
						<FieldError message={create.error?.fieldError("priceCents")} />
					</div>
					{/* Field-level server errors render above; show the summary for everything else */}
					{formError || (create.error && !create.error.problem.fieldErrors) ? (
						<p className="text-destructive text-sm">{formError ?? create.error?.message}</p>
					) : null}
					<Button type="submit" disabled={create.isPending}>
						{create.isPending ? "Creating…" : "Create listing"}
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
