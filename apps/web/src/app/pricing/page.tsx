import type { Metadata } from "next";
import Link from "next/link";
import { PRICING_PLANS } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Pricing — GuildForge",
  description: "Simple, transparent pricing for GuildForge. Start free and upgrade when you need more builds, guilds, or enterprise features.",
  openGraph: {
    title: "Pricing — GuildForge",
    description: "Start free. Build unlimited Discord servers with Pro.",
  },
};

const plans = PRICING_PLANS;

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* Header */}
      <div className="border-b border-slate-800 px-6 py-4 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="GuildForge" className="w-8 h-8 rounded-lg" />
          <span className="font-bold text-lg text-white">GuildForge</span>
        </Link>
        <span className="text-slate-600 text-sm ml-2">/ Pricing</span>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20">
        {/* Hero */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-2">
            Simple, transparent pricing
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Build better Discord servers,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              at any scale
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Start free. Upgrade when you need more builds, more guilds, or more power.
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border bg-slate-900 p-7 flex flex-col gap-6 transition-all ${
                plan.highlight
                  ? "border-indigo-500 shadow-indigo-500/20 shadow-xl"
                  : plan.id === "studio"
                    ? "border-amber-500/40 shadow-amber-500/10 shadow-xl"
                    : "border-slate-700"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-600 text-white shadow">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div>
                <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mb-1">{plan.name}</p>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-slate-500 text-sm pb-1">/{plan.period}</span>
                </div>
                <p className="text-slate-400 text-sm">{plan.description}</p>
              </div>

              <a
                href={plan.ctaHref}
                className={`w-full text-center py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  plan.highlight
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                    : plan.id === "studio"
                      ? "bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                }`}
              >
                {plan.cta}
              </a>

              <div className="space-y-2.5">
                {plan.features.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="mt-0.5 text-emerald-400 flex-shrink-0">✓</span>
                    {item}
                  </div>
                ))}
                {plan.missing.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="mt-0.5 flex-shrink-0">–</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-2xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently asked questions</h2>
          {[
            {
              q: "What counts as a \"build\"?",
              a: "A build is one execution of a server plan — creating channels, roles, and permissions in a Discord guild. Drafting and editing plans don't count."
            },
            {
              q: "Can I change plans later?",
              a: "Yes. Upgrade or downgrade at any time. Your build count resets on the 1st of each month regardless of plan."
            },
            {
              q: "Does GuildForge access my server without me clicking Execute?",
              a: "No. GuildForge only touches your server when you explicitly click Execute. It never makes background changes."
            },
            {
              q: "What happens if I hit my build limit?",
              a: "You'll see a clear message and won't be able to execute. Your drafted plans are saved and ready to run the next month or when you upgrade."
            }
          ].map(({ q, a }) => (
            <details key={q} className="group border border-slate-800 rounded-xl overflow-hidden">
              <summary className="px-5 py-4 flex items-center justify-between cursor-pointer text-slate-200 font-medium hover:bg-slate-800/50 transition-colors">
                {q}
                <span className="ml-4 text-slate-500 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
              </summary>
              <p className="px-5 pb-5 text-slate-400 text-sm leading-relaxed">{a}</p>
            </details>
          ))}
        </div>

        {/* Back CTA */}
        <div className="mt-16 text-center">
          <Link
            href="/dashboard"
            className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
