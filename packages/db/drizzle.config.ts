import { defineConfig } from "drizzle-kit";
import { dbEnv } from "./src/env.js";

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/schema/index.ts",
	out: "./drizzle",
	dbCredentials: {
		url: dbEnv().DATABASE_URL,
	},
});
