import { createApiClient, createQueries } from "@repo/api-client";
import { env } from "~/env";

/** Browser client: sends the session cookie with credentials: "include". */
export const api = createApiClient({ baseUrl: env.NEXT_PUBLIC_API_URL });
export const queries = createQueries(api);
