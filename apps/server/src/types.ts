import type { Session, User } from "./auth";

export interface AppEnv {
	Variables: {
		user: User | null;
		session: Session["session"] | null;
	};
}

export interface AuthedEnv {
	Variables: {
		user: User;
		session: Session["session"];
	};
}
