import { Suspense } from "react";
import { connection } from "next/server";
import { PLANS, isActive } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { BillingButton } from "./BillingButton";

async function Content({ searchParams }: { searchParams: Promise<{ paiement?: string }> }) {
  await connection();
  const { paiement } = await searchParams;
  const supabase = await createClient();
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status, current_period_end, stripe_customer_id")
    .maybeSingle();
  const pro = isActive(sub?.status);
  const end = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString("fr-FR", { dateStyle: "long" })
    : null;

  return (
    <div className="mx-auto max-w-4xl">
      <p className="eyebrow">Abonnement</p>
      <h1 className="mt-4 text-4xl font-medium sm:text-5xl">
        Tu es sur l'offre <span className="text-gradient">{pro ? PLANS.pro.name : PLANS.free.name}</span>.
      </h1>

      {paiement === "ok" && (
        <p className="mt-6 rounded-2xl border border-brand/20 bg-brand-soft px-5 py-4 text-brand-dark">
          {pro
            ? "Paiement confirmé, bienvenue dans Pro."
            : "Paiement reçu. L'activation peut prendre quelques secondes : recharge la page dans un instant."}
        </p>
      )}

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div className={`card flex flex-col ${pro ? "" : "ring-2 ring-brand"}`}>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Gratuit {!pro && "· Offre actuelle"}</p>
          <p className="mt-4 text-5xl font-medium tracking-[-0.05em]">0 €</p>
          <ul className="mt-6 space-y-2 text-muted">
            <li>{PLANS.free.dailyGenerations} générations par jour</li>
            <li>Suivi des candidatures illimité</li>
            <li>Export PDF</li>
          </ul>
        </div>

        <div className="relative flex flex-col overflow-hidden rounded-[28px] bg-ink p-6 text-white sm:p-7">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand/70 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 left-4 h-64 w-64 rounded-full bg-violet/50 blur-3xl" />
          <div className="relative flex h-full flex-col">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-cyan">Pro {pro && "· Offre actuelle"}</p>
            <p className="mt-4 text-5xl font-medium tracking-[-0.05em]">
              {PLANS.pro.priceLabel} <span className="text-lg font-normal tracking-normal text-white/60">/ mois</span>
            </p>
            <ul className="mt-6 space-y-2 text-white/75">
              <li>{PLANS.pro.dailyGenerations} générations par jour</li>
              <li>Tout ce qui est inclus dans Gratuit</li>
              <li>Annulable à tout moment</li>
            </ul>
            {pro && end && <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.14em] text-white/50">Période en cours jusqu'au {end}</p>}
            <div className="mt-8 md:mt-auto md:pt-8">
              {pro ? (
                <BillingButton endpoint="/api/stripe/portal" label="Gérer mon abonnement" />
              ) : (
                <BillingButton endpoint="/api/stripe/checkout" label="Passer à Pro" />
              )}
            </div>
          </div>
        </div>
      </div>
      <p className="mt-6 text-sm text-muted">Paiement sécurisé par Stripe. Abonnement mensuel renouvelé automatiquement, résiliable à tout moment, avec 14 jours pour changer d'avis. Voir les <a href="/cgv" target="_blank" className="font-semibold text-brand">conditions générales</a>.</p>
    </div>
  );
}

export default function Page(props: { searchParams: Promise<{ paiement?: string }> }) {
  return (
    <Suspense>
      <Content {...props} />
    </Suspense>
  );
}
