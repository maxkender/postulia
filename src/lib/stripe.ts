import Stripe from "stripe";

let client: Stripe | null = null;

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

export const PLANS = {
  free: { name: "Gratuit", dailyGenerations: 3 },
  pro: { name: "Pro", dailyGenerations: 50, priceLabel: "9,99 €" },
} as const;

export function isActive(status: string | null | undefined) {
  return status === "active" || status === "trialing";
}
