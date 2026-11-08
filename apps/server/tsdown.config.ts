import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["src/index.ts"],
	platform: "node",
	format: "esm",
	clean: true,
	// Clients get AppType from src/app.ts (see package.json exports), not from dist.
	dts: false,
	// Workspace packages ship TypeScript source, so bundle them into the output.
	// Their npm dependencies (drizzle-orm, pg) must also be listed in this app's
	// package.json. Then they stay external, and Better Auth's drizzle adapter
	// shares the same drizzle-orm copy as @repo/db.
	deps: {
		alwaysBundle: [/^@repo\//],
	},
});
