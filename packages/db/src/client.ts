import { drizzle } from "drizzle-orm/node-postgres";
import { dbEnv } from "./env";
import { relations } from "./relations";

export const db = drizzle({ connection: { connectionString: dbEnv().DATABASE_URL }, relations });

export type Database = typeof db;
