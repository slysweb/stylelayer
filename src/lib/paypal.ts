/**
 * PayPal REST API helper for Subscriptions.
 *
 * Required env vars:
 *   PAYPAL_CLIENT_ID
 *   PAYPAL_CLIENT_SECRET
 *   PAYPAL_MODE  — "sandbox" | "live" (default: "sandbox")
 */

function getBaseUrl(): string {
  const mode = process.env.PAYPAL_MODE ?? "sandbox";
  return mode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

/** Get an OAuth2 access token from PayPal */
async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be set");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${getBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal OAuth failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export type PlanConfig = {
  plan: string;
  billing: "monthly" | "annual";
  credits: number;
  paypalPlanId: string;
};

/** Plan ID mapping — these must be created in PayPal Dashboard first */
export function getPlanConfig(
  plan: string,
  billing: "monthly" | "annual"
): PlanConfig | null {
  const configs: Record<string, Record<string, PlanConfig>> = {
    influencer: {
      monthly: {
        plan: "influencer",
        billing: "monthly",
        credits: 60,
        paypalPlanId: process.env.PAYPAL_INFLUENCER_MONTHLY_PLAN_ID ?? "",
      },
      annual: {
        plan: "influencer",
        billing: "annual",
        credits: 60,
        paypalPlanId: process.env.PAYPAL_INFLUENCER_ANNUAL_PLAN_ID ?? "",
      },
    },
    studio_pro: {
      monthly: {
        plan: "studio_pro",
        billing: "monthly",
        credits: 200,
        paypalPlanId: process.env.PAYPAL_STUDIO_MONTHLY_PLAN_ID ?? "",
      },
      annual: {
        plan: "studio_pro",
        billing: "annual",
        credits: 200,
        paypalPlanId: process.env.PAYPAL_STUDIO_ANNUAL_PLAN_ID ?? "",
      },
    },
  };

  // Normalize plan name
  const normalizedPlan = plan.toLowerCase().replace(/\s+/g, "_");
  return configs[normalizedPlan]?.[billing] ?? null;
}

/** Create a PayPal subscription and return the approval URL */
export async function createSubscription(
  paypalPlanId: string,
  returnUrl: string,
  cancelUrl: string
): Promise<{ subscriptionId: string; approvalUrl: string }> {
  const accessToken = await getAccessToken();

  const res = await fetch(`${getBaseUrl()}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      plan_id: paypalPlanId,
      application_context: {
        brand_name: "StyleLayer AI",
        locale: "en-US",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal create subscription failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as {
    id: string;
    links: { rel: string; href: string }[];
  };

  const approvalLink = data.links.find((l) => l.rel === "approve");
  if (!approvalLink) {
    throw new Error("No approval URL in PayPal response");
  }

  return {
    subscriptionId: data.id,
    approvalUrl: approvalLink.href,
  };
}

/** Get subscription details from PayPal */
export async function getSubscriptionDetails(
  subscriptionId: string
): Promise<{
  id: string;
  status: string;
  plan_id: string;
  subscriber?: { email_address?: string };
  billing_info?: {
    next_billing_time?: string;
    last_payment?: { amount?: { value: string } };
  };
}> {
  const accessToken = await getAccessToken();

  const res = await fetch(
    `${getBaseUrl()}/v1/billing/subscriptions/${subscriptionId}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `PayPal get subscription failed: ${res.status} ${text}`
    );
  }

  return res.json() as Promise<{
    id: string;
    status: string;
    plan_id: string;
    subscriber?: { email_address?: string };
    billing_info?: {
      next_billing_time?: string;
      last_payment?: { amount?: { value: string } };
    };
  }>;
}

/** Cancel a PayPal subscription */
export async function cancelSubscription(
  subscriptionId: string,
  reason: string = "Customer requested cancellation"
): Promise<void> {
  const accessToken = await getAccessToken();

  const res = await fetch(
    `${getBaseUrl()}/v1/billing/subscriptions/${subscriptionId}/cancel`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
    }
  );

  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    throw new Error(`PayPal cancel failed: ${res.status} ${text}`);
  }
}
