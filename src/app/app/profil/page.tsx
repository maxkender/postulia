"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Profil() {
  const [form, setForm] = useState({ full_name: "", headline: "", background: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    createClient()
      .from("profiles")
      .select("full_name, headline, background")
      .maybeSingle()
      .then(({ data }) => {
        if (data) setForm({ full_name: data.full_name ?? "", headline: data.headline ?? "", background: data.background ?? "" });
        setLoading(false);
      });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: data.user!.id, ...form, updated_at: new Date().toISOString() });
    setMessage(error ? `Erreur : ${error.message}` : "Profil enregistré.");
    setSaving(false);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-semibold">Mon profil</h1>
      <p className="mt-2 text-muted">Ces informations servent de base à tous tes documents. Plus c'est précis, meilleur est le résultat.</p>
      <form onSubmit={save} className="card mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="name">Nom complet</label>
            <input id="name" className="input" value={form.full_name} disabled={loading} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="headline">Titre professionnel</label>
            <input id="headline" className="input" placeholder="Ex. Développeuse front-end" value={form.headline} disabled={loading} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="background">Parcours</label>
          <textarea
            id="background"
            required
            rows={16}
            className="input font-mono text-[13px]"
            placeholder={"Colle ici ton CV actuel, ou décris :\n- tes expériences (poste, entreprise, dates, missions, résultats)\n- ta formation\n- tes compétences, langues, coordonnées"}
            value={form.background}
            disabled={loading}
            onChange={(e) => setForm({ ...form, background: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="btn" disabled={saving || loading}>{saving ? "Enregistrement…" : "Enregistrer"}</button>
          {message && <p className="text-sm text-muted">{message}</p>}
        </div>
      </form>
    </div>
  );
}
