import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSubscription, getPlanConfig } from "@/lib/paypal";
import { getDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = (await request.json()) as {
      plan?: string;
      billing?: "monthly" | "annual";
    };

    const { plan, billing } = body;
    if (!plan || !billing) {
      return NextResponse.json(
        { error: "Missing plan or billing cycle" },
        { status: 400 }
      );
    }

    const config = getPlanConfig(plan, billing);
    if (!config || !config.paypalPlanId) {
      return NextResponse.json(
        { error: "Invalid plan or PayPal plan not configured" },
        { status: 400 }
      );
    }

    const baseUrl = new URL(request.url).origin;
    const returnUrl = `${baseUrl}/api/paypal/subscription-callback?user_id=${encodeURIComponent(session.id)}&plan=${encodeURIComponent(config.plan)}&billing=${encodeURIComponent(config.billing)}&credits=${config.credits}`;
    const cancelUrl = `${baseUrl}/pricing?cancelled=1`;

    const { subscriptionId, approvalUrl } = await createSubscription(
      config.paypalPlanId,
      returnUrl,
      cancelUrl
    );

    // Save pending subscription to DB
    const db = await getDb();
    if (db) {
      await db
        .prepare(
          `INSERT INTO subscriptions (user_id, paypal_subscription_id, plan, billing_cycle, status, credits_per_month)
           VALUES (?, ?, ?, ?, 'PENDING', ?)`
        )
        .bind(
          session.id,
          subscriptionId,
          config.plan,
          config.billing,
          config.credits
        )
        .run();
    }

    return NextResponse.json({ approvalUrl, subscriptionId });
  } catch (e) {
    console.error("create-subscription error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create subscription" },
      { status: 500 }
    );
  }
}
