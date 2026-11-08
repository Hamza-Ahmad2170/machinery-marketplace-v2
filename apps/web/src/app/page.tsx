import { Button } from "@repo/ui/components/button";

export default function HomePage() {
	return (
		<main className="flex min-h-svh flex-col items-start justify-center gap-4 p-6">
			<h1 className="font-heading text-2xl font-semibold">Machinery Marketplace</h1>
			<p className="text-muted-foreground text-sm">The web app is running.</p>
			<Button>Button</Button>
		</main>
	);
}
