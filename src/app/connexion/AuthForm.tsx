"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AuthForm() {
  const params = useSearchParams();
  const router = useRouter();
  const [signup, setSignup] = useState(params.get("mode") === "inscription");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(params.get("erreur") ? "Ce lien n'est plus valide. Reconnecte-toi." : "");
  const [notice, setNotice] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");
    const supabase = createClient();
    if (signup) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) setError(error.message);
      else if (data.session) {
        router.push("/app");
        router.refresh();
      } else setNotice("Compte créé. Clique sur le lien reçu par e-mail pour l'activer.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError("E-mail ou mot de passe incorrect, ou compte pas encore activé.");
      else {
        router.push("/app");
        router.refresh();
      }
    }
    setLoading(false);
  }

  return (
    <div className="card">
      <h1 className="font-display text-2xl font-semibold">{signup ? "Créer un compte" : "Se connecter"}</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="email">E-mail</label>
          <input id="email" type="email" required autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete={signup ? "new-password" : "current-password"}
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {signup && <p className="mt-1.5 text-xs text-muted">8 caractères minimum.</p>}
        </div>
        {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {notice && <p className="rounded-xl bg-brand-soft px-3 py-2 text-sm text-brand-dark">{notice}</p>}
        <button className="btn w-full" disabled={loading}>
          {loading ? "Un instant…" : signup ? "Créer mon compte" : "Se connecter"}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-muted">
        {signup ? "Déjà un compte ?" : "Pas encore de compte ?"}{" "}
        <button type="button" className="font-semibold text-brand" onClick={() => setSignup(!signup)}>
          {signup ? "Se connecter" : "S'inscrire"}
        </button>
      </p>
    </div>
  );
}
