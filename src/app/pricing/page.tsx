"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Navigation } from "@/components/navigation";
import { Check } from "lucide-react";

type BillingCycle = "monthly" | "annual";

const PLANS = [
  {
    name: "Free",
    tag: "Get Started",
    monthlyPrice: 0,
    annualPrice: 0,
    credits: "3 Credits / month",
    features: [
      "3 credits per month",
      "Standard resolution export",
      "Watermarked output",
      "Email support",
    ],
    cta: "Current Plan",
    highlighted: false,
    paypalMonthlyPlanId: null,
    paypalAnnualPlanId: null,
  },
  {
    name: "Influencer",
    tag: "Most Popular",
    monthlyPrice: 14.99,
    annualPrice: 11.99,
    credits: "60 Credits / month",
    features: [
      "60 credits per month",
      "4K high-resolution export",
      "No watermark",
      "Priority processing",
      "Email support",
    ],
    cta: "Subscribe",
    highlighted: true,
    paypalMonthlyPlanId: process.env.NEXT_PUBLIC_PAYPAL_INFLUENCER_MONTHLY_PLAN_ID ?? "",
    paypalAnnualPlanId: process.env.NEXT_PUBLIC_PAYPAL_INFLUENCER_ANNUAL_PLAN_ID ?? "",
  },
  {
    name: "Studio Pro",
    tag: "Power Users",
    monthlyPrice: 34.99,
    annualPrice: 27.99,
    credits: "200 Credits / month",
    features: [
      "200 credits per month",
      "4K high-resolution export",
      "No watermark",
      "Transparent background PNG",
      "Batch processing",
      "Priority support",
    ],
    cta: "Subscribe",
    highlighted: false,
    paypalMonthlyPlanId: process.env.NEXT_PUBLIC_PAYPAL_STUDIO_MONTHLY_PLAN_ID ?? "",
    paypalAnnualPlanId: process.env.NEXT_PUBLIC_PAYPAL_STUDIO_ANNUAL_PLAN_ID ?? "",
  },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null))
      .catch(() => setUser(null));
  }, []);

  const handleSubscribe = useCallback(
    async (planName: string) => {
      if (!user) {
        window.location.href = "/sign-in?from=/pricing";
        return;
      }

      setLoadingPlan(planName);
      try {
        const res = await fetch("/api/paypal/create-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ plan: planName.toLowerCase(), billing }),
        });
        const data = await res.json();
        if (data.approvalUrl) {
          window.location.href = data.approvalUrl;
        } else {
          alert(data.error ?? "Failed to create subscription");
        }
      } catch {
        alert("Something went wrong. Please try again.");
      } finally {
        setLoadingPlan(null);
      }
    },
    [user, billing]
  );

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/">
            <Image
              src="/logo.jpeg"
              alt="StyleLayer AI"
              width={814}
              height={138}
              className="h-8 w-auto sm:h-9"
            />
          </Link>
          <Navigation />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        {/* Title */}
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-stone-400">
            Pricing
          </p>
          <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Choose Your Plan
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-stone-500">
            Start free and upgrade as you grow. All paid plans include
            high-resolution exports and watermark-free images.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="mt-10 flex items-center justify-center gap-3">
          <div className="inline-flex rounded-full border border-stone-200 bg-white p-1">
            <button
              onClick={() => setBilling("monthly")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                billing === "monthly"
                  ? "bg-stone-900 text-white shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("annual")}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                billing === "annual"
                  ? "bg-stone-900 text-white shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              Annual
            </button>
          </div>
          {billing === "annual" && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              Save 20%
            </span>
          )}
        </div>

        {/* Cards */}
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const price =
              billing === "monthly" ? plan.monthlyPrice : plan.annualPrice;
            const isLoading = loadingPlan === plan.name;

            return (
              <div
                key={plan.name}
                className={`relative flex flex-col overflow-hidden rounded-2xl border bg-white transition-shadow ${
                  plan.highlighted
                    ? "border-stone-900 shadow-lg"
                    : "border-stone-200 shadow-sm hover:shadow-md"
                }`}
              >
                {/* Tag */}
                {plan.highlighted && (
                  <div className="bg-stone-900 px-4 py-2 text-center text-xs font-semibold uppercase tracking-wider text-white">
                    {plan.tag}
                  </div>
                )}

                <div className="flex flex-1 flex-col p-6 sm:p-8">
                  {/* Plan name */}
                  <div>
                    {!plan.highlighted && (
                      <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                        {plan.tag}
                      </p>
                    )}
                    <h3 className="mt-1 text-xl font-bold">{plan.name}</h3>
                    <p className="mt-1 text-sm text-stone-500">
                      {plan.credits}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mt-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold tracking-tight">
                        ${price.toFixed(2)}
                      </span>
                      {price > 0 && (
                        <span className="text-sm text-stone-400">/ month</span>
                      )}
                    </div>
                    {billing === "annual" && price > 0 && (
                      <p className="mt-1 text-xs text-stone-400">
                        Billed ${(price * 12).toFixed(2)} annually
                      </p>
                    )}
                    {price === 0 && (
                      <p className="mt-1 text-xs text-stone-400">
                        Free forever
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="mt-8 flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                        <span className="text-sm text-stone-600">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-8">
                    {price === 0 ? (
                      <Link
                        href={user ? "/generate" : "/sign-in"}
                        className="block w-full rounded-xl border border-stone-200 bg-white py-3 text-center text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-50"
                      >
                        {user ? "Go to Generator" : "Sign Up Free"}
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleSubscribe(plan.name)}
                        disabled={isLoading}
                        className={`block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all disabled:opacity-60 ${
                          plan.highlighted
                            ? "bg-stone-900 text-white shadow-sm hover:bg-stone-800"
                            : "border border-stone-900 bg-stone-900 text-white hover:bg-stone-800"
                        }`}
                      >
                        {isLoading ? "Redirecting to PayPal..." : plan.cta}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment badge */}
        <div className="mt-12 text-center">
          <p className="text-xs text-stone-400">
            Secure payments powered by PayPal. Cancel anytime.
          </p>
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-20 max-w-2xl">
          <h2 className="text-center font-serif text-2xl font-semibold tracking-tight">
            Pricing FAQ
          </h2>
          <div className="mt-8 divide-y divide-stone-200">
            <details className="group py-5">
              <summary className="flex cursor-pointer items-center justify-between font-medium text-stone-900 hover:text-stone-600">
                What happens when I run out of credits?
                <svg className="ml-4 h-5 w-5 flex-shrink-0 text-stone-400 transition-transform group-open:rotate-45" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-stone-500">
                You can continue using the free tier (3 credits/month) or upgrade your plan at any time.
                Unused credits do not roll over to the next month.
              </p>
            </details>
            <details className="group py-5">
              <summary className="flex cursor-pointer items-center justify-between font-medium text-stone-900 hover:text-stone-600">
                Can I switch plans at any time?
                <svg className="ml-4 h-5 w-5 flex-shrink-0 text-stone-400 transition-transform group-open:rotate-45" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-stone-500">
                Yes! You can upgrade, downgrade, or cancel your subscription at any time.
                Changes take effect at the start of your next billing cycle.
              </p>
            </details>
            <details className="group py-5">
              <summary className="flex cursor-pointer items-center justify-between font-medium text-stone-900 hover:text-stone-600">
                How does the annual billing work?
                <svg className="ml-4 h-5 w-5 flex-shrink-0 text-stone-400 transition-transform group-open:rotate-45" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-stone-500">
                Annual billing is charged once per year at a 20% discount compared to monthly billing.
                You receive your full monthly credit allocation each month throughout the year.
              </p>
            </details>
            <details className="group py-5">
              <summary className="flex cursor-pointer items-center justify-between font-medium text-stone-900 hover:text-stone-600">
                What payment methods are accepted?
                <svg className="ml-4 h-5 w-5 flex-shrink-0 text-stone-400 transition-transform group-open:rotate-45" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-stone-500">
                We accept all major payment methods through PayPal, including credit cards,
                debit cards, and PayPal balance. All transactions are secure and encrypted.
              </p>
            </details>
            <details className="group py-5">
              <summary className="flex cursor-pointer items-center justify-between font-medium text-stone-900 hover:text-stone-600">
                Is there a refund policy?
                <svg className="ml-4 h-5 w-5 flex-shrink-0 text-stone-400 transition-transform group-open:rotate-45" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-stone-500">
                If you&apos;re not satisfied, you can cancel within the first 7 days for a full
                refund. After that, you can cancel anytime and your plan remains active until
                the end of the current billing period.
              </p>
            </details>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200/80">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-stone-400">
            &copy; {new Date().getFullYear()} StyleLayer. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
