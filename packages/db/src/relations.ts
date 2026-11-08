import { authRelations } from "./schema/auth.js";

// App relations go here as `defineRelations(...)` parts, merged with the auth relations.
export const relations = { ...authRelations };
