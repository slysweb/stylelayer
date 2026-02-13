import { getDb } from "./db";

export type DbUser = {
  id: number;
  google_id: string;
  email: string;
  plan: string;
  credits_balance: number;
  created_at: string;
  updated_at: string;
};

/**
 * 获取或创建用户。新用户赠送 3 积分并记录 ONBOARDING 流水。
 */
export async function getOrCreateUser(
  googleId: string,
  email: string
): Promise<DbUser | null> {
  const db = await getDb();
  if (!db) return null;

  const existing = await db
    .prepare("SELECT * FROM users WHERE google_id = ?")
    .bind(googleId)
    .first();

  if (existing) {
    return existing as DbUser;
  }

  await db
    .prepare(
      `INSERT INTO users (google_id, email, plan, credits_balance) VALUES (?, ?, 'FREE', 3)`
    )
    .bind(googleId, email)
    .run();

  await db
    .prepare(
      `INSERT INTO credit_logs (user_id, amount, action_type, description) VALUES (?, 3, 'ONBOARDING', 'New user signup bonus')`
    )
    .bind(googleId)
    .run();

  const created = await db
    .prepare("SELECT * FROM users WHERE google_id = ?")
    .bind(googleId)
    .first();

  return created as DbUser;
}

/**
 * 获取用户（不创建）
 */
export async function getUserByGoogleId(
  googleId: string
): Promise<DbUser | null> {
  const db = await getDb();
  if (!db) return null;
  const row = await db
    .prepare("SELECT * FROM users WHERE google_id = ?")
    .bind(googleId)
    .first();
  return row as DbUser | null;
}
