import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Connexion requise." }, { status: 401 });

  const stripe = getStripe();
  if (!stripe) return Response.json({ error: "Le paiement n'est pas encore configuré." }, { status: 503 });

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!sub?.stripe_customer_id) return Response.json({ error: "Aucun abonnement à gérer." }, { status: 400 });

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${new URL(request.url).origin}/app/abonnement`,
    });
    return Response.json({ url: session.url });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Impossible d'ouvrir l'espace de facturation." }, { status: 502 });
  }
}
