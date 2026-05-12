/**
 * Single source of truth for pricing data.
 * Used by both the landing page (/page.tsx) and the standalone pricing page (/pricing/page.tsx).
 * Update prices here — they propagate everywhere.
 */

export interface PricingPlan {
  id: "free" | "pro" | "studio";
  name: string;
  price: string;
  period: string;
  description: string;
  badge: string | null;
  cta: string;
  ctaHref: string;
  features: string[];
  missing: string[];
  highlight: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Try GuildForge with no commitment.",
    badge: null,
    cta: "Get Started",
    ctaHref: "/login",
    features: [
      "3 server builds per month",
      "1 active guild",
      "Snapshot & restore (up to 5)",
      "AI chat architect",
      "Community support",
    ],
    missing: [
      "Priority AI generation",
      "Unlimited builds",
      "Multi-guild dashboard",
      "Bot flow templates",
    ],
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$12",
    period: "per month",
    description: "For serious community builders and server admins.",
    badge: "Most Popular",
    cta: "Start Pro",
    ctaHref: "/login?plan=pro",
    features: [
      "25 server builds per month",
      "Up to 5 active guilds",
      "Unlimited snapshots & restore",
      "AI chat architect",
      "Priority AI generation",
      "Bot flow templates",
      "Publish to Template Gallery",
      "Email support",
    ],
    missing: [
      "White-label builds",
      "API access",
    ],
    highlight: true,
  },
  {
    id: "studio",
    name: "Studio",
    price: "$49",
    period: "per month",
    description: "Agencies and studios building Discord at scale.",
    badge: "Enterprise",
    cta: "Contact Sales",
    ctaHref: "mailto:hello@guildforge.dev",
    features: [
      "Unlimited builds",
      "Unlimited guilds",
      "Unlimited snapshots",
      "AI chat architect",
      "Priority AI generation",
      "Bot flow templates",
      "Publish to Template Gallery",
      "White-label option",
      "API access",
      "Dedicated Slack support",
      "Custom SLA",
    ],
    missing: [],
    highlight: false,
  },
];
