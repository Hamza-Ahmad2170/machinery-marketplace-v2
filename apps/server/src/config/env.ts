import { dbEnv } from "@repo/db/env";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	extends: [dbEnv()],
	server: {
		NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
		PORT: z.coerce.number().int().default(3001),
		BETTER_AUTH_SECRET: z.string().min(32),
		/** Public URL of this API, e.g. http://localhost:3001 */
		BETTER_AUTH_URL: z.url(),
		/** Comma-separated list of web app origins allowed to call the API with cookies. */
		CORS_ORIGINS: z.string().transform((value) =>
			value
				.split(",")
				.map((origin) => origin.trim())
				.filter(Boolean),
		),
		/** Set to share sessions across sibling subdomains, e.g. example.com */
		COOKIE_DOMAIN: z.string().optional(),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
