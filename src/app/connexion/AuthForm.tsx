"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleButton } from "@/components/GoogleButton";
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
    <div className="card p-8 sm:p-10">
      <p className="eyebrow">{signup ? "Inscription" : "Connexion"}</p>
      <h1 className="mt-4 text-3xl font-medium">{signup ? "Crée ton compte" : "Bon retour"}</h1>
      <div className="mt-6">
        <GoogleButton />
      </div>
      <form onSubmit={submit} className="space-y-4">
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
        {error && <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {notice && <p className="rounded-2xl bg-brand-soft px-3 py-2 text-sm text-brand-dark">{notice}</p>}
        <button className="btn-blue w-full py-3.5" disabled={loading}>
          {loading ? "Un instant…" : signup ? "Créer mon compte" : "Se connecter"}
        </button>
      </form>
      {signup && <p className="mt-3 text-xs leading-relaxed text-muted">En créant un compte, tu acceptes les <Link href="/cgv" target="_blank" className="underline underline-offset-2">conditions générales</Link> et la <Link href="/confidentialite" target="_blank" className="underline underline-offset-2">politique de confidentialité</Link>.</p>}
      <p className="mt-5 text-center text-sm text-muted">
        {signup ? "Déjà un compte ?" : "Pas encore de compte ?"}{" "}
        <button type="button" className="font-medium text-brand underline-offset-4 hover:underline" onClick={() => setSignup(!signup)}>
          {signup ? "Se connecter" : "S'inscrire"}
        </button>
      </p>
    </div>
  );
}
