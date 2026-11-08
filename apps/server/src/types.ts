import type { Session, User } from "#lib/auth.js";

/** Context for routes that may be called by anyone. */
export type AppEnv = {
	Variables: {
		user: User | null;
		session: Session | null;
	};
};

/** Context for routes that need a signed-in user. */
export type AuthedEnv = {
	Variables: {
		user: User;
		session: Session;
	};
};
