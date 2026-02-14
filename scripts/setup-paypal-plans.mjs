/**
 * Setup PayPal Subscription Plans
 *
 * Usage:
 *   1. Fill in PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET below (or set in env)
 *   2. Run: node scripts/setup-paypal-plans.mjs
 *   3. Copy the output Plan IDs to your .env.local and Cloudflare Dashboard
 */

// Load .env.local
import { readFileSync } from "fs";
import { resolve } from "path";
try {
  const envPath = resolve(process.cwd(), ".env.local");
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx);
      const val = trimmed.slice(eqIdx + 1);
      if (!process.env[key]) process.env[key] = val;
    }
  }
} catch {}

const CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "YOUR_CLIENT_ID";
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "YOUR_CLIENT_SECRET";
const BASE_URL = "https://api-m.sandbox.paypal.com"; // Change to https://api-m.paypal.com for live

async function getAccessToken() {
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Auth failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data.access_token;
}

async function createProduct(token) {
  const res = await fetch(`${BASE_URL}/v1/catalogs/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      name: "StyleLayer AI",
      description: "AI-powered flat lay and product extraction tool",
      type: "SERVICE",
      category: "SOFTWARE",
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Create product failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  console.log(`✓ Product created: ${data.id}`);
  return data.id;
}

async function createPlan(token, productId, plan) {
  const res = await fetch(`${BASE_URL}/v1/billing/plans`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      product_id: productId,
      name: plan.name,
      description: plan.description,
      billing_cycles: [
        {
          frequency: {
            interval_unit: plan.intervalUnit,
            interval_count: 1,
          },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0, // infinite
          pricing_scheme: {
            fixed_price: {
              value: plan.price,
              currency_code: "USD",
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: "CANCEL",
        payment_failure_threshold: 3,
      },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Create plan "${plan.name}" failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  console.log(`✓ Plan created: ${data.name} → ${data.id}`);
  return data.id;
}

async function main() {
  if (CLIENT_ID === "YOUR_CLIENT_ID") {
    console.error("Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET");
    console.error("Either edit this script or set env vars:");
    console.error(
      "  PAYPAL_CLIENT_ID=xxx PAYPAL_CLIENT_SECRET=xxx node scripts/setup-paypal-plans.mjs"
    );
    process.exit(1);
  }

  console.log("Authenticating with PayPal Sandbox...\n");
  const token = await getAccessToken();

  console.log("Creating product...");
  const productId = await createProduct(token);

  console.log("\nCreating subscription plans...\n");

  const plans = [
    {
      name: "Influencer Monthly",
      description: "60 credits/month, 4K export, no watermark",
      intervalUnit: "MONTH",
      price: "14.99",
      envKey: "PAYPAL_INFLUENCER_MONTHLY_PLAN_ID",
    },
    {
      name: "Influencer Annual",
      description: "60 credits/month, 4K export, no watermark — billed annually",
      intervalUnit: "YEAR",
      price: "143.88",
      envKey: "PAYPAL_INFLUENCER_ANNUAL_PLAN_ID",
    },
    {
      name: "Studio Pro Monthly",
      description: "200 credits/month, batch processing, transparent PNG",
      intervalUnit: "MONTH",
      price: "34.99",
      envKey: "PAYPAL_STUDIO_MONTHLY_PLAN_ID",
    },
    {
      name: "Studio Pro Annual",
      description: "200 credits/month, batch processing, transparent PNG — billed annually",
      intervalUnit: "YEAR",
      price: "335.88",
      envKey: "PAYPAL_STUDIO_ANNUAL_PLAN_ID",
    },
  ];

  const results = {};
  for (const plan of plans) {
    const planId = await createPlan(token, productId, plan);
    results[plan.envKey] = planId;
  }

  console.log("\n========================================");
  console.log("Add these to .env.local and Cloudflare:");
  console.log("========================================\n");
  for (const [key, value] of Object.entries(results)) {
    console.log(`${key}=${value}`);
  }
  console.log("");
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
