"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, ExternalLink, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from "lucide-react";

interface SubscriptionData {
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  limits: {
    serversPerMonth: number;
    templatesPerMonth: number;
    teamMembers: number;
    healthChecksPerDay: number;
    alertRules: number;
  };
}

const API = process.env.NEXT_PUBLIC_API_URL;

export default function BillingPage() {
  const [sub, setSub] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/billing/subscription`, { credentials: "include" })
      .then((r) => r.json())
      .then(setSub)
      .catch(() => setSub(null))
      .finally(() => setLoading(false));
  }, []);

  const handleCheckout = async (planId: string, interval: "monthly" | "yearly") => {
    setCheckoutLoading(`${planId}-${interval}`);
    try {
      const res = await fetch(`${API}/billing/checkout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, interval }),
      });
      const data = await res.json();
      if (data.url) window.location.assign(data.url);
    } catch {
      /* handled */
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handlePortal = async () => {
    try {
      const res = await fetch(`${API}/billing/portal`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.url) window.location.assign(data.url);
    } catch {
      /* handled */
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <CreditCard className="w-8 h-8 text-indigo-400" />
          <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        </div>

        {/* Current Plan Card */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-slate-400 mb-1">Current Plan</p>
              <p className="text-2xl font-bold capitalize text-indigo-400">{sub?.plan ?? "Free"}</p>
            </div>
            <div className="flex items-center gap-2">
              {sub?.status === "active" ? (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-sm">
                  <CheckCircle2 className="w-4 h-4" /> Active
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-sm">
                  <AlertCircle className="w-4 h-4" /> {sub?.status ?? "Free"}
                </span>
              )}
            </div>
          </div>

          {sub?.currentPeriodEnd && (
            <p className="text-sm text-slate-400 mb-4">
              {sub.cancelAtPeriodEnd ? "Cancels" : "Renews"} on{" "}
              <strong className="text-white">{new Date(sub.currentPeriodEnd).toLocaleDateString()}</strong>
            </p>
          )}

          {/* Usage Limits */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            {[
              { label: "Servers/mo", value: sub?.limits.serversPerMonth ?? 3, unlimited: (sub?.limits.serversPerMonth ?? 3) === -1 },
              { label: "Templates/mo", value: sub?.limits.templatesPerMonth ?? 5, unlimited: (sub?.limits.templatesPerMonth ?? 5) === -1 },
              { label: "Team Members", value: sub?.limits.teamMembers ?? 0, unlimited: (sub?.limits.teamMembers ?? 0) === -1 },
              { label: "Health Checks/day", value: sub?.limits.healthChecksPerDay ?? 1, unlimited: (sub?.limits.healthChecksPerDay ?? 1) === -1 },
              { label: "Alert Rules", value: sub?.limits.alertRules ?? 2, unlimited: (sub?.limits.alertRules ?? 2) === -1 },
            ].map((limit) => (
              <div key={limit.label} className="bg-slate-800/50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-white">{limit.unlimited ? "∞" : limit.value}</p>
                <p className="text-xs text-slate-400">{limit.label}</p>
              </div>
            ))}
          </div>

          {sub?.plan !== "free" && (
            <button onClick={handlePortal} className="mt-6 flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition">
              <ExternalLink className="w-4 h-4" /> Manage in Stripe Portal
            </button>
          )}
        </div>

        {/* Upgrade Plans */}
        {sub?.plan === "free" && (
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                id: "pro", name: "Pro", monthlyPrice: "$19", yearlyPrice: "$190",
                features: ["25 servers/month", "50 templates/month", "10 team members", "24 health checks/day", "20 alert rules", "Priority support"],
              },
              {
                id: "studio", name: "Studio", monthlyPrice: "$49", yearlyPrice: "$490",
                features: ["Unlimited servers", "Unlimited templates", "50 team members", "Unlimited health checks", "Unlimited alert rules", "Dedicated support", "Custom branding"],
              },
            ].map((plan) => (
              <div key={plan.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-indigo-500/50 transition">
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-3xl font-bold text-indigo-400 mb-1">{plan.monthlyPrice}<span className="text-sm text-slate-400 font-normal">/mo</span></p>
                <p className="text-sm text-slate-500 mb-6">or {plan.yearlyPrice}/year (save ~17%)</p>

                <ul className="space-y-2 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleCheckout(plan.id, "monthly")}
                    disabled={!!checkoutLoading}
                    className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium text-sm transition disabled:opacity-50"
                  >
                    {checkoutLoading === `${plan.id}-monthly` ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Monthly"}
                  </button>
                  <button
                    onClick={() => handleCheckout(plan.id, "yearly")}
                    disabled={!!checkoutLoading}
                    className="flex-1 py-2.5 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium text-sm transition disabled:opacity-50"
                  >
                    {checkoutLoading === `${plan.id}-yearly` ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Yearly"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
