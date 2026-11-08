import { drizzle } from "drizzle-orm/node-postgres";
import { dbEnv } from "./env.js";
import { relations } from "./relations.js";

export const db = drizzle({
	connection: { connectionString: dbEnv().DATABASE_URL },
	relations,
});

export type Database = typeof db;

/** The `tx` passed to `db.transaction(async (tx) => ...)`. */
export type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

/** First argument of every query function, so callers can pass `db` or a transaction. */
export type DbOrTx = Database | Transaction;
