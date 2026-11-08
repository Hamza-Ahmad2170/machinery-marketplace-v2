import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { db } from "@repo/db/client";
import * as schema from "@repo/db/schema";
import { betterAuth } from "better-auth";
import { env } from "#config/env.js";

export const auth = betterAuth({
	baseURL: env.BETTER_AUTH_URL,
	secret: env.BETTER_AUTH_SECRET,
	trustedOrigins: env.CORS_ORIGINS,
	database: drizzleAdapter(db, { provider: "pg", schema }),
	emailAndPassword: {
		enabled: true,
	},
	advanced: {
		database: {
			joins: true,
		},
		...(env.COOKIE_DOMAIN
			? { crossSubDomainCookies: { enabled: true, domain: env.COOKIE_DOMAIN } }
			: {}),
	},
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
