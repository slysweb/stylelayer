import { NextRequest, NextResponse } from "next/server";
import { getSubscriptionDetails } from "@/lib/paypal";
import { getDb } from "@/lib/db";

/**
 * PayPal redirects the user here after approving the subscription.
 * We verify the subscription status with PayPal, activate it in our DB,
 * update the user plan and credits, and redirect to dashboard.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subscriptionId = searchParams.get("subscription_id");
    const userId = searchParams.get("user_id");
    const plan = searchParams.get("plan");
    const billing = searchParams.get("billing");
    const credits = parseInt(searchParams.get("credits") ?? "0", 10);

    if (!subscriptionId || !userId || !plan) {
      return NextResponse.redirect(
        new URL("/pricing?error=missing_params", request.url)
      );
    }

    // Verify subscription with PayPal
    const details = await getSubscriptionDetails(subscriptionId);

    if (details.status !== "ACTIVE" && details.status !== "APPROVED") {
      return NextResponse.redirect(
        new URL(`/pricing?error=not_active&status=${details.status}`, request.url)
      );
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.redirect(
        new URL("/pricing?error=db_unavailable", request.url)
      );
    }

    // Update subscription to ACTIVE
    await db
      .prepare(
        `UPDATE subscriptions
         SET status = 'ACTIVE',
             current_period_start = CURRENT_TIMESTAMP,
             current_period_end = datetime('now', '+1 month'),
             updated_at = CURRENT_TIMESTAMP
         WHERE paypal_subscription_id = ?`
      )
      .bind(subscriptionId)
      .run();

    // Update user plan and add credits
    const planName = plan === "studio_pro" ? "STUDIO_PRO" : "INFLUENCER";
    await db
      .prepare(
        `UPDATE users
         SET plan = ?,
             credits_balance = credits_balance + ?,
             updated_at = CURRENT_TIMESTAMP
         WHERE google_id = ?`
      )
      .bind(planName, credits, userId)
      .run();

    // Log credit addition
    await db
      .prepare(
        `INSERT INTO credit_logs (user_id, amount, action_type, description)
         VALUES (?, ?, 'PURCHASE', ?)`
      )
      .bind(
        userId,
        credits,
        `${planName} ${billing} subscription activated — ${credits} credits`
      )
      .run();

    return NextResponse.redirect(
      new URL("/dashboard?subscription=active", request.url)
    );
  } catch (e) {
    console.error("subscription-callback error:", e);
    return NextResponse.redirect(
      new URL("/pricing?error=callback_failed", request.url)
    );
  }
}
