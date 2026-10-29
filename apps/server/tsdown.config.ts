import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["src/index.ts"],
	platform: "node",
	format: "esm",
	deps: {
		// Workspace packages ship TypeScript source and their dependencies aren't installed
		// in this app's node_modules, so inline them (and what they import) into the output.
		alwaysBundle: [/^@repo\//],
		onlyBundle: false,
	},
});
