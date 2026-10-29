import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export function dbEnv() {
	return createEnv({
		server: {
			DATABASE_URL: z.url(),
		},
		runtimeEnv: process.env,
		emptyStringAsUndefined: true,
		skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	});
}
