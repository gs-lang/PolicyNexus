"use client";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { auth } from "@/lib/firebase";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    users: "Up to 25 users",
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID ?? "",
    features: [
      "Unlimited policies",
      "Policy assignments",
      "Acknowledgment tracking",
      "Email reminders",
      "Compliance dashboard",
    ],
    cta: "Start free trial",
    highlighted: false,
  },
  {
    id: "growth",
    name: "Growth",
    price: 79,
    users: "Up to 100 users",
    priceId: process.env.NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID ?? "",
    features: [
      "Everything in Starter",
      "Priority support",
      "Advanced reporting",
      "Custom policy categories",
      "Audit log export",
    ],
    cta: "Start free trial",
    highlighted: true,
  },
  {
    id: "business",
    name: "Business",
    price: 199,
    users: "Up to 500 users",
    priceId: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID ?? "",
    features: [
      "Everything in Growth",
      "Dedicated onboarding",
      "SLA guarantee",
      "Custom integrations",
      "SSO (coming soon)",
    ],
    cta: "Start free trial",
    highlighted: false,
  },
];

export default function PricingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  async function handleSelect(plan: (typeof PLANS)[number]) {
    if (!user) {
      router.push(`/signup?plan=${plan.id}`);
      return;
    }
    setLoadingPlan(plan.id);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken ?? ""}`,
        },
        body: JSON.stringify({ priceId: plan.priceId }),
      });
      if (!res.ok) throw new Error("Checkout failed");
      const { url } = await res.json() as { url: string };
      window.location.href = url;
    } catch {
      alert("Something went wrong. Please try again.");
      setLoadingPlan(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h1>
        <p className="text-lg text-gray-600">
          14-day free trial on all plans — no credit card required.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-2xl border p-8 flex flex-col ${
              plan.highlighted
                ? "border-indigo-600 shadow-lg ring-2 ring-indigo-600"
                : "border-gray-200"
            }`}
          >
            {plan.highlighted && (
              <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">
                Most popular
              </div>
            )}
            <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
            <div className="mt-4 mb-1">
              <span className="text-4xl font-extrabold text-gray-900">${plan.price}</span>
              <span className="text-gray-500">/mo</span>
            </div>
            <p className="text-sm text-gray-500 mb-6">{plan.users}</p>

            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-indigo-500 mt-0.5">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSelect(plan)}
              disabled={loadingPlan === plan.id || loading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-colors ${
                plan.highlighted
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                  : "bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-60"
              }`}
            >
              {loadingPlan === plan.id ? "Redirecting…" : plan.cta}
            </button>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-gray-400 mt-10">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
