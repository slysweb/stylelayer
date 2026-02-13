import { getDbOrThrow } from "./db";

const CREDITS_PER_GENERATION = 1;

/**
 * 检查积分并扣减，插入任务和流水。失败时退款。
 */
export async function createGenerationAndDeductCredits(
  googleId: string,
  originalUrl: string,
  promptUsed: string
): Promise<{ generationId: string } | { error: string }> {
  const db = await getDbOrThrow();

  const user = await db
    .prepare("SELECT id, google_id, credits_balance FROM users WHERE google_id = ?")
    .bind(googleId)
    .first();

  if (!user) {
    return { error: "User not found" };
  }

  const balance = (user as { credits_balance: number }).credits_balance;
  if (balance < CREDITS_PER_GENERATION) {
    return { error: "Insufficient credits. Please top up." };
  }

  const generationId = crypto.randomUUID();

  await db
    .prepare(
      `INSERT INTO generations (id, user_id, type, original_url, status, prompt_used, credits_spent) VALUES (?, ?, 'DECON', ?, 'PENDING', ?, ?)`
    )
    .bind(generationId, googleId, originalUrl, promptUsed, CREDITS_PER_GENERATION)
    .run();

  await db
    .prepare(
      `INSERT INTO credit_logs (user_id, amount, action_type, description) VALUES (?, ?, 'GENERATION', ?)`
    )
    .bind(googleId, -CREDITS_PER_GENERATION, `Generation ${generationId}`)
    .run();

  await db
    .prepare("UPDATE users SET credits_balance = credits_balance - ?, updated_at = CURRENT_TIMESTAMP WHERE google_id = ?")
    .bind(CREDITS_PER_GENERATION, googleId)
    .run();

  return { generationId };
}

/**
 * 更新任务结果（成功）
 */
export async function completeGeneration(
  generationId: string,
  resultUrl: string
): Promise<void> {
  const db = await getDbOrThrow();
  await db
    .prepare("UPDATE generations SET result_url = ?, status = 'COMPLETED' WHERE id = ?")
    .bind(resultUrl, generationId)
    .run();
}

/**
 * 任务失败时退款
 */
export async function failAndRefundGeneration(
  generationId: string,
  googleId: string
): Promise<void> {
  const db = await getDbOrThrow();
  await db
    .prepare("UPDATE generations SET status = 'FAILED' WHERE id = ?")
    .bind(generationId)
    .run();

  await db
    .prepare(
      `INSERT INTO credit_logs (user_id, amount, action_type, description) VALUES (?, 1, 'REFUND', ?)`
    )
    .bind(googleId, `Refund for failed generation ${generationId}`)
    .run();

  await db
    .prepare("UPDATE users SET credits_balance = credits_balance + 1, updated_at = CURRENT_TIMESTAMP WHERE google_id = ?")
    .bind(googleId)
    .run();
}
