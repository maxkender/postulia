"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const STATUSES = [
  { id: "a_postuler", label: "À postuler" },
  { id: "postule", label: "Postulé" },
  { id: "entretien", label: "Entretien" },
  { id: "offre", label: "Offre" },
  { id: "refus", label: "Refus" },
] as const;

type Application = {
  id: string;
  company: string;
  job_title: string;
  url: string | null;
  status: string;
  created_at: string;
};

export default function Candidatures() {
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ job_title: "", company: "", url: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    createClient()
      .from("applications")
      .select("id, company, job_title, url, status, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setItems(data ?? []);
        setLoading(false);
      });
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const url = form.url.trim();
    if (url && !/^https?:\/\//i.test(url)) {
      setError("Le lien doit commencer par http:// ou https://");
      return;
    }
    const { data, error } = await createClient()
      .from("applications")
      .insert({ job_title: form.job_title, company: form.company, url: url || null })
      .select("id, company, job_title, url, status, created_at")
      .single();
    if (error) setError(error.message);
    else {
      setItems((prev) => [data, ...prev.filter((a) => a.id !== data.id)]);
      setForm({ job_title: "", company: "", url: "" });
    }
  }

  async function setStatus(id: string, status: string) {
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    await createClient().from("applications").update({ status }).eq("id", id);
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cette candidature ?")) return;
    setItems((prev) => prev.filter((a) => a.id !== id));
    await createClient().from("applications").delete().eq("id", id);
  }

  return (
    <div>
      <h1 className="page-title">Mes candidatures</h1>
      <form onSubmit={add} className="card mt-6 grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
        <div>
          <label className="label" htmlFor="job">Poste</label>
          <input id="job" required className="input" value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="company">Entreprise</label>
          <input id="company" required className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
        </div>
        <div>
          <label className="label" htmlFor="url">Lien de l'offre</label>
          <input id="url" type="url" className="input" placeholder="https://" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
        </div>
        <button className="btn">Ajouter</button>
        {error && <p className="text-sm text-red-700 md:col-span-4">{error}</p>}
      </form>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {STATUSES.map((s) => {
          const list = items.filter((a) => a.status === s.id);
          return (
            <section key={s.id} className="glass rounded-[24px] p-3">
              <h2 className="flex items-center justify-between px-1 pb-2 text-sm font-semibold">
                {s.label}
                <span className="rounded-full bg-line px-2 py-0.5 text-xs">{list.length}</span>
              </h2>
              <div className="space-y-2">
                {list.map((a) => (
                  <article key={a.id} className="rounded-2xl border border-line bg-white p-3.5">
                    <p className="text-sm font-semibold">{a.job_title}</p>
                    <p className="text-sm text-muted">{a.company}</p>
                    {a.url && /^https?:\/\//i.test(a.url) && (
                      <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-brand">Voir l'offre ↗</a>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <select aria-label="Statut" className="input rounded-xl px-2 py-1.5 text-xs" value={a.status} onChange={(e) => setStatus(a.id, e.target.value)}>
                        {STATUSES.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                      </select>
                      <button aria-label="Supprimer" className="px-1 text-muted hover:text-red-700" onClick={() => remove(a.id)}>✕</button>
                    </div>
                  </article>
                ))}
                {!list.length && <p className="px-1 py-3 text-xs text-muted">{loading ? "Chargement…" : "Rien ici."}</p>}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
