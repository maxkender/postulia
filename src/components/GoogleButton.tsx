"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/** Bouton « Continuer avec Google ». Ne s'affiche que si Google est activé dans Supabase. */
export function GoogleButton({ label = "Continuer avec Google" }: { label?: string }) {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! } })
      .then((r) => r.json())
      .then((d) => setEnabled(Boolean(d?.external?.google)))
      .catch(() => {});
  }, []);

  if (!enabled) return null;

  async function go() {
    setLoading(true);
    setError("");
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError("Connexion Google impossible. Réessaie ou utilise ton e-mail.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={go} disabled={loading} className="btn-ghost w-full gap-3 py-3.5 text-[15px]">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.200-2.300H12v4.400h6.200a5.3 5.3 0 01-2.3 3.500v2.900h3.700c2.2-2 3.4-5 3.4-8.500z" />
          <path fill="#34A853" d="M12 23.500c3.1 0 5.7-1 7.6-2.800l-3.7-2.900c-1 .7-2.3 1.1-3.9 1.1-3 0-5.5-2-6.4-4.700H1.800v3A11.5 11.5 0 0012 23.500z" />
          <path fill="#FBBC05" d="M5.6 14.200a6.9 6.9 0 010-4.400v-3H1.800a11.5 11.5 0 000 10.400z" />
          <path fill="#EA4335" d="M12 5.100c1.7 0 3.2.600 4.4 1.7l3.3-3.300A11.5 11.5 0 001.8 6.800l3.8 3c.900-2.7 3.4-4.7 6.4-4.700z" />
        </svg>
        {loading ? "Redirection…" : label}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
      <p className="my-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">ou</p>
    </div>
  );
}
