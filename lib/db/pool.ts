import "server-only";
import { Pool } from "pg";

declare global {
  var __zenithPgPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and point it at a Postgres " +
        "database (a free Neon project works great — see deploy-guide.txt)."
    );
  }
  return new Pool({
    connectionString,
    // Most managed Postgres providers (Neon, Supabase, RDS) require SSL:
    // this enables it without requiring a specific CA bundle on the client.
    ssl: connectionString.includes("localhost") || connectionString.includes("127.0.0.1")
      ? undefined
      : { rejectUnauthorized: false },
  });
}

// Created lazily on first actual query, not at module import time. Next.js
// statically imports every route module during the build's "collect page
// data" step (even for fully dynamic routes) just to inspect its exports —
// if the pool were created at module scope, a missing DATABASE_URL would
// crash the build itself, before the app ever runs. Deferring creation
// until a query actually happens keeps build and runtime concerns separate.
function getPool(): Pool {
  if (!globalThis.__zenithPgPool) {
    globalThis.__zenithPgPool = createPool();
  }
  return globalThis.__zenithPgPool;
}

export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await getPool().query(text, params);
  return result.rows as T[];
}

export async function queryOne<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
