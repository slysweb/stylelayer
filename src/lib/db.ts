import { getCloudflareContext } from "@opennextjs/cloudflare";

export type D1Database = {
  prepare: (query: string) => {
    bind: (...params: unknown[]) => {
      first: () => Promise<unknown>;
      run: () => Promise<{ meta: { changes: number }; results?: unknown[] }>;
      all: () => Promise<{ results: unknown[] }>;
    };
    first: () => Promise<unknown>;
    run: () => Promise<{ meta: { changes: number }; results?: unknown[] }>;
    all: () => Promise<{ results: unknown[] }>;
  };
};

export async function getDb(): Promise<D1Database | null> {
  const ctx = await getCloudflareContext({ async: true });
  const db = (ctx.env as { DB?: D1Database }).DB;
  return db ?? null;
}

export async function getDbOrThrow(): Promise<D1Database> {
  const db = await getDb();
  if (!db) {
    throw new Error("D1 database not configured");
  }
  return db;
}
