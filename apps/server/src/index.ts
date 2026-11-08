import { serve } from "@hono/node-server";
import { env } from "#config/env.js";
import { app } from "./app.js";

const server = serve({ fetch: app.fetch, port: env.PORT }, (info) => {
	console.log(`API listening on http://localhost:${info.port}`);
});

const shutdown = () => server.close(() => process.exit(0));
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
