import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { db } from "@repo/db/client";
import * as schema from "@repo/db/schema";
import { betterAuth } from "better-auth";
import { env } from "./env";

export const auth = betterAuth({
	baseURL: env.BETTER_AUTH_URL,
	secret: env.BETTER_AUTH_SECRET,
	// Origins allowed to call auth endpoints (web, admin, mobile scheme)
	trustedOrigins: env.CORS_ORIGINS,
	database: drizzleAdapter(db, { provider: "pg", schema }),
	emailAndPassword: { enabled: true },
	advanced: {
		database: { joins: true },
		// When web and server are sibling subdomains, share the cookie so web's server can read it
		crossSubDomainCookies: env.COOKIE_DOMAIN
			? { enabled: true, domain: env.COOKIE_DOMAIN }
			: undefined,
	},
});

export type Session = typeof auth.$Infer.Session;
export type User = Session["user"];
