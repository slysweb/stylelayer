import { getDb } from "./db";
import type { SessionUser } from "./auth";

const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

function generateSessionId(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** 创建 session 并返回 session_id */
export async function createDbSession(user: SessionUser): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const id = generateSessionId();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SEC * 1000)
    .toISOString()
    .replace("T", " ")
    .slice(0, 19);

  await db
    .prepare(
      "INSERT INTO sessions (id, user_id, email, name, picture, expires_at) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .bind(id, user.id, user.email, user.name ?? null, user.picture ?? null, expiresAt)
    .run();

  return id;
}

/** 根据 session_id 验证并返回 user，过期或无效返回 null */
export async function getSessionByToken(
  sessionId: string
): Promise<SessionUser | null> {
  const db = await getDb();
  if (!db) return null;

  const row = (await db
    .prepare(
      "SELECT user_id, email, name, picture FROM sessions WHERE id = ? AND expires_at > datetime('now')"
    )
    .bind(sessionId)
    .first()) as { user_id: string; email: string; name: string | null; picture: string | null } | null;

  if (!row) return null;

  return {
    id: row.user_id,
    email: row.email,
    name: row.name ?? row.email.split("@")[0],
    picture: row.picture ?? undefined,
  };
}

/** 删除 session（用于 sign out） */
export async function deleteDbSession(sessionId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.prepare("DELETE FROM sessions WHERE id = ?").bind(sessionId).run();
}
