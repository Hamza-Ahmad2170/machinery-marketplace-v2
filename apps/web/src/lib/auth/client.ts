import { createAuthClient } from "better-auth/react";
import { env } from "@/env";

/**
 * Better Auth client for Client Components: sign-up, sign-in, sign-out and `useSession()`.
 * It calls the API's /api/auth routes and sends cookies cross-origin by default.
 * In Server Components, use `getSession` from ./server instead.
 */
export const authClient = createAuthClient({ baseURL: env.NEXT_PUBLIC_API_URL });
