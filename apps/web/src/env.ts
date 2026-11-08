import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	client: {
		/** Origin of the API (apps/server), e.g. http://localhost:3001. Same value as the server's BETTER_AUTH_URL. */
		NEXT_PUBLIC_API_URL: z.url(),
	},
	// Next.js inlines NEXT_PUBLIC_ variables at build time, so each one is read by its full name here.
	experimental__runtimeEnv: {
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
	},
	emptyStringAsUndefined: true,
});
