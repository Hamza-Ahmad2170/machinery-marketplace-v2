"use client";

import { Button } from "@repo/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { signInInput, signUpInput } from "@repo/validators";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { authClient } from "~/lib/auth-client";

export default function SignInPage() {
	const router = useRouter();
	const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const data = Object.fromEntries(new FormData(event.currentTarget));

		setError(null);
		let result: { error: { message?: string } | null };
		if (mode === "sign-up") {
			const parsed = signUpInput.safeParse(data);
			if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Invalid input");
			setPending(true);
			result = await authClient.signUp.email(parsed.data);
		} else {
			const parsed = signInInput.safeParse(data);
			if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Invalid input");
			setPending(true);
			result = await authClient.signIn.email(parsed.data);
		}
		setPending(false);

		if (result.error) {
			setError(result.error.message ?? "Something went wrong");
			return;
		}
		router.push("/");
		router.refresh();
	}

	return (
		<main className="mx-auto flex max-w-sm flex-col px-4 py-16">
			<Card>
				<CardHeader>
					<CardTitle>{mode === "sign-in" ? "Sign in" : "Create account"}</CardTitle>
				</CardHeader>
				<CardContent>
					<form className="flex flex-col gap-3" onSubmit={onSubmit}>
						{mode === "sign-up" ? (
							<div className="grid gap-1.5">
								<Label htmlFor="name">Name</Label>
								<Input id="name" name="name" autoComplete="name" required />
							</div>
						) : null}
						<div className="grid gap-1.5">
							<Label htmlFor="email">Email</Label>
							<Input id="email" name="email" type="email" autoComplete="email" required />
						</div>
						<div className="grid gap-1.5">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								name="password"
								type="password"
								autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
								required
							/>
						</div>
						{error ? <p className="text-destructive text-sm">{error}</p> : null}
						<Button type="submit" disabled={pending}>
							{pending ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Create account"}
						</Button>
						<Button
							type="button"
							variant="link"
							onClick={() => {
								setMode(mode === "sign-in" ? "sign-up" : "sign-in");
								setError(null);
							}}
						>
							{mode === "sign-in" ? "Need an account? Sign up" : "Have an account? Sign in"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</main>
	);
}
