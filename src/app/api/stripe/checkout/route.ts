import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Connexion requise." }, { status: 401 });

  const stripe = getStripe();
  const price = process.env.STRIPE_PRICE_ID;
  if (!stripe || !price) {
    return Response.json({ error: "Le paiement n'est pas encore configuré." }, { status: 503 });
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const origin = new URL(request.url).origin;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      ...(sub?.stripe_customer_id ? { customer: sub.stripe_customer_id } : { customer_email: user.email }),
      client_reference_id: user.id,
      subscription_data: { metadata: { user_id: user.id } },
      allow_promotion_codes: true,
      locale: "fr",
      success_url: `${origin}/app/abonnement?paiement=ok`,
      cancel_url: `${origin}/app/abonnement`,
    });
    return Response.json({ url: session.url });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Impossible d'ouvrir le paiement. Réessaie dans un instant." }, { status: 502 });
  }
}
