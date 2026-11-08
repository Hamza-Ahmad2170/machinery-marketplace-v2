import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

/** Database variables. Apps extend this slice in their own env.ts. */
export const dbEnv = () =>
	createEnv({
		server: {
			DATABASE_URL: z.url(),
		},
		runtimeEnv: process.env,
		emptyStringAsUndefined: true,
	});
