"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Onboarding } from "@/components/Onboarding";
import { readPending, saveOnboarding } from "@/lib/onboarding";
import { createClient } from "@/lib/supabase/client";

/** Après la création du compte : enregistre les réponses données avant l'inscription, ou pose les questions. */
export default function Bienvenue() {
  const router = useRouter();
  const [ask, setAsk] = useState(false);

  useEffect(() => {
    const pending = readPending();
    const complete = pending?.situation && pending?.poste && (pending?.lieux?.length || pending?.lieu);
    if (!complete) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- décision unique au montage, selon le stockage local
      setAsk(true);
      return;
    }
    saveOnboarding(createClient(), pending).then(({ error }) => {
      if (error) setAsk(true);
      else {
        router.replace("/app");
        router.refresh();
      }
    });
  }, [router]);

  if (!ask) return <p className="py-20 text-center text-sm font-semibold uppercase tracking-[0.12em] text-brand">Préparation de ton espace…</p>;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-cream">
      <Onboarding mode="app" />
    </div>
  );
}
