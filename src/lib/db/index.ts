import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

// Create a connection pool that persists across requests
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL is not set. Please configure your database connection in .env.local"
      );
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Keep connections alive longer for dev performance
      idleTimeoutMillis: 30000,
      // Allow up to 10 connections
      max: 10,
    });
  }
  return pool;
}

function createDb() {
  if (!process.env.DATABASE_URL) {
    // Return a proxy that throws helpful errors at query time instead of module load time.
    // This allows the app to build and render pages that don't need the DB.
    return new Proxy({} as ReturnType<typeof drizzle>, {
      get(_, prop) {
        if (prop === "select" || prop === "insert" || prop === "update" || prop === "delete") {
          return () => {
            throw new Error(
              "DATABASE_URL is not set. Please configure your database connection in .env.local"
            );
          };
        }
        return undefined;
      },
    });
  }

  return drizzle(getPool(), { schema });
}

export const db = createDb();
