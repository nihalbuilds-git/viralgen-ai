export type PlanId = "free" | "pro" | "enterprise";

export interface Plan {
  id: PlanId;
  name: string;
  price: string;
  priceNum: number;
  tagline: string;
  monthlyGenerations: number; // -1 = unlimited
  monthlyImages: number;
  exports: boolean;
  featured?: boolean;
  features: { label: string; included: boolean }[];
}

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    priceNum: 0,
    tagline: "For trying things out",
    monthlyGenerations: 50,
    monthlyImages: 5,
    exports: false,
    features: [
      { label: "50 text generations / mo", included: true },
      { label: "5 AI images / mo", included: true },
      { label: "All core tools", included: true },
      { label: "Export as .txt / .pdf", included: false },
      { label: "Brand voice memory", included: false },
      { label: "Priority support", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    priceNum: 29,
    tagline: "For solo creators & marketers",
    monthlyGenerations: 2000,
    monthlyImages: 100,
    exports: true,
    featured: true,
    features: [
      { label: "2,000 text generations / mo", included: true },
      { label: "100 AI images / mo", included: true },
      { label: "All tools unlocked", included: true },
      { label: "Export as .txt / .pdf", included: true },
      { label: "Brand voice memory", included: true },
      { label: "Priority support", included: true },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$99",
    priceNum: 99,
    tagline: "For growing teams",
    monthlyGenerations: -1,
    monthlyImages: 1000,
    exports: true,
    features: [
      { label: "Unlimited text generations", included: true },
      { label: "1,000 AI images / mo", included: true },
      { label: "Shared brand voices", included: true },
      { label: "Export as .txt / .pdf", included: true },
      { label: "API access", included: true },
      { label: "SSO & advanced security", included: true },
    ],
  },
];

export const PLAN_BY_ID: Record<PlanId, Plan> = {
  free: PLANS[0],
  pro: PLANS[1],
  enterprise: PLANS[2],
};

export const DEFAULT_PLAN: PlanId = "free";
