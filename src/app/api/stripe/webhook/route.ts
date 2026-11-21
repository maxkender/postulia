import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

async function save(sub: Stripe.Subscription, userId?: string | null) {
  const admin = createAdminClient();
  if (!admin) throw new Error("SUPABASE_SECRET_KEY manquante");
  const customer = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const periodEnd = sub.items.data[0]?.current_period_end;
  const row = {
    stripe_customer_id: customer,
    stripe_subscription_id: sub.id,
    status: sub.status,
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    updated_at: new Date().toISOString(),
  };
  const id = userId ?? sub.metadata?.user_id;
  const { error } = id
    ? await admin.from("subscriptions").upsert({ user_id: id, ...row })
    : await admin.from("subscriptions").update(row).eq("stripe_customer_id", customer);
  if (error) throw new Error(error.message);
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!stripe || !secret) return new Response("Paiement non configuré", { status: 503 });
  if (!signature) return new Response("Signature manquante", { status: 400 });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(await request.text(), signature, secret);
  } catch {
    return new Response("Signature invalide", { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (session.subscription) {
        const id = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
        await save(await stripe.subscriptions.retrieve(id), session.client_reference_id);
      }
    } else if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      await save(event.data.object);
    }
  } catch (error) {
    console.error(error);
    return new Response("Erreur de traitement", { status: 500 });
  }
  return Response.json({ received: true });
}
