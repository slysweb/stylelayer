import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

/**
 * PayPal Webhook handler.
 * Handles subscription lifecycle events:
 *  - BILLING.SUBSCRIPTION.ACTIVATED
 *  - BILLING.SUBSCRIPTION.CANCELLED
 *  - BILLING.SUBSCRIPTION.EXPIRED
 *  - BILLING.SUBSCRIPTION.SUSPENDED
 *  - PAYMENT.SALE.COMPLETED (recurring payment)
 *
 * Configure this URL in PayPal Developer Dashboard → Webhooks:
 *   https://stylelayer.app/api/paypal/webhook
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      event_type: string;
      resource: {
        id?: string;
        billing_agreement_id?: string;
        status?: string;
        amount?: { total?: string; value?: string };
      };
    };

    const eventType = body.event_type;
    const resource = body.resource;

    console.log(`PayPal webhook: ${eventType}`, JSON.stringify(resource).slice(0, 500));

    const db = await getDb();
    if (!db) {
      // Accept webhook even if DB is down to prevent PayPal retries
      return NextResponse.json({ received: true });
    }

    switch (eventType) {
      case "BILLING.SUBSCRIPTION.ACTIVATED": {
        const subId = resource.id;
        if (subId) {
          await db
            .prepare(
              `UPDATE subscriptions SET status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP
               WHERE paypal_subscription_id = ?`
            )
            .bind(subId)
            .run();
        }
        break;
      }

      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.EXPIRED":
      case "BILLING.SUBSCRIPTION.SUSPENDED": {
        const subId = resource.id;
        if (subId) {
          const newStatus = eventType.includes("CANCELLED")
            ? "CANCELLED"
            : eventType.includes("EXPIRED")
              ? "EXPIRED"
              : "SUSPENDED";

          await db
            .prepare(
              `UPDATE subscriptions SET status = ?, updated_at = CURRENT_TIMESTAMP
               WHERE paypal_subscription_id = ?`
            )
            .bind(newStatus, subId)
            .run();

          // Downgrade user to FREE plan
          const sub = (await db
            .prepare(
              "SELECT user_id FROM subscriptions WHERE paypal_subscription_id = ?"
            )
            .bind(subId)
            .first()) as { user_id: string } | null;

          if (sub) {
            // Only downgrade if no other active subscriptions
            const otherActive = (await db
              .prepare(
                `SELECT COUNT(*) as cnt FROM subscriptions
                 WHERE user_id = ? AND status = 'ACTIVE' AND paypal_subscription_id != ?`
              )
              .bind(sub.user_id, subId)
              .first()) as { cnt: number } | null;

            if (!otherActive || otherActive.cnt === 0) {
              await db
                .prepare(
                  `UPDATE users SET plan = 'FREE', updated_at = CURRENT_TIMESTAMP
                   WHERE google_id = ?`
                )
                .bind(sub.user_id)
                .run();
            }
          }
        }
        break;
      }

      case "PAYMENT.SALE.COMPLETED": {
        // Recurring payment completed — add monthly credits
        const subId = resource.billing_agreement_id;
        if (subId) {
          const sub = (await db
            .prepare(
              "SELECT user_id, credits_per_month, plan FROM subscriptions WHERE paypal_subscription_id = ? AND status = 'ACTIVE'"
            )
            .bind(subId)
            .first()) as {
            user_id: string;
            credits_per_month: number;
            plan: string;
          } | null;

          if (sub) {
            // Add credits
            await db
              .prepare(
                `UPDATE users SET credits_balance = credits_balance + ?, updated_at = CURRENT_TIMESTAMP
                 WHERE google_id = ?`
              )
              .bind(sub.credits_per_month, sub.user_id)
              .run();

            // Log
            await db
              .prepare(
                `INSERT INTO credit_logs (user_id, amount, action_type, description)
                 VALUES (?, ?, 'PURCHASE', ?)`
              )
              .bind(
                sub.user_id,
                sub.credits_per_month,
                `Recurring ${sub.plan} payment — ${sub.credits_per_month} credits`
              )
              .run();

            // Update period
            await db
              .prepare(
                `UPDATE subscriptions
                 SET current_period_start = CURRENT_TIMESTAMP,
                     current_period_end = datetime('now', '+1 month'),
                     updated_at = CURRENT_TIMESTAMP
                 WHERE paypal_subscription_id = ?`
              )
              .bind(subId)
              .run();
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("PayPal webhook error:", e);
    // Always return 200 to prevent PayPal retries
    return NextResponse.json({ received: true, error: "Internal error" });
  }
}
