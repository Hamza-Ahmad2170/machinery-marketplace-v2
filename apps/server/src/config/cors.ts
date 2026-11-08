import type { cors } from "hono/cors";
import { env } from "./env.js";

type CorsOptions = NonNullable<Parameters<typeof cors>[0]>;

/** Browser apps (web, admin) allowed to call the API with cookies. Mobile apps aren't subject to CORS. */
export const corsOptions = {
	origin: env.CORS_ORIGINS,
	credentials: true,
	allowHeaders: ["Content-Type", "Authorization"],
	allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
} satisfies CorsOptions;
