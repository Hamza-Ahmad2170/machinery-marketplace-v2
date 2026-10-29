import { defineConfig } from "drizzle-kit";
import { dbEnv } from "./src/env";

// Scripts load apps/server/.env, the only app that talks to the database.
export default defineConfig({
	dialect: "postgresql",
	schema: "./src/schema/index.ts",
	out: "./drizzle",
	dbCredentials: { url: dbEnv().DATABASE_URL },
	verbose: true,
});
