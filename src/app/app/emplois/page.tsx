"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { countries } from "@/lib/countries";
import type { Job } from "@/lib/jobs";
import { createClient } from "@/lib/supabase/client";

export default function Emplois() {
  const router = useRouter();
  // Les noms de pays viennent du navigateur : on les charge après l'affichage pour éviter tout écart avec le serveur.
  const [list, setList] = useState<{ code: string; name: string }[]>([]);
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [where, setWhere] = useState("");
  const [remote, setRemote] = useState(false);
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [sources, setSources] = useState<{ jooble: boolean; adzuna: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  // Pré-remplit avec le poste visé donné à l'inscription.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chargement unique au montage
    setList(countries());
    createClient()
      .from("profiles")
      .select("headline")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.headline) setQ((v) => v || data.headline);
      });
  }, []);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ q, country, where, countryName: list.find((c) => c.code === country)?.name ?? "", remote: remote ? "1" : "" });
      const res = await fetch(`/api/jobs?${params}`);
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error ?? "La recherche a échoué. Réessaie dans un instant.");
      setJobs(data.jobs);
      setSources(data.sources);
    } catch (err) {
      setError(err instanceof TypeError ? "Connexion interrompue. Réessaie." : (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  /** Crée le parcours de l'offre, avec le texte complet de l'annonce quand il est lisible. */
  async function start(job: Job) {
    setCreating(job.id);
    let description = job.description;
    if (description.length < 600) {
      const res = await fetch("/api/import-job", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: job.url }) }).catch(() => null);
      const data = res?.ok ? await res.json().catch(() => null) : null;
      if (data?.jobDescription?.length > description.length) description = data.jobDescription;
    }
    const { data, error } = await createClient()
      .from("applications")
      .insert({ job_title: job.title.slice(0, 200), company: job.company.slice(0, 200) || "Entreprise non précisée", url: job.url, description })
      .select("id")
      .single();
    if (error || !data) {
      setError("L'offre n'a pas pu être enregistrée. Réessaie.");
      setCreating(null);
      return;
    }
    router.push(`/app/offres/${data.id}`);
  }

  return (
    <div>
      <p className="eyebrow">Offres d'emploi</p>
      <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Trouve des offres partout dans le monde</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">Cherche un poste, choisis un pays, puis lance le parcours de candidature en un clic.</p>

      <form onSubmit={search} className="card mt-8 grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-end">
        <div>
          <label className="label" htmlFor="q">Poste ou mot-clé</label>
          <input id="q" required minLength={2} maxLength={100} className="input" placeholder="Ex. Product manager" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="country">Pays</label>
          <select id="country" className="input" value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="">Tous les pays</option>
            {list.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="where">Ville</label>
          <input id="where" maxLength={80} className="input" placeholder="Facultatif" value={where} onChange={(e) => setWhere(e.target.value)} />
        </div>
        <button className="btn-blue py-3" disabled={loading}>{loading ? "Recherche…" : "Rechercher"}</button>
        <label className="flex items-center gap-2 text-sm font-medium md:col-span-4">
          <input type="checkbox" className="h-4 w-4 accent-[#5b4dff]" checked={remote} onChange={(e) => setRemote(e.target.checked)} />
          Télétravail uniquement
        </label>
      </form>
      {error && <p role="alert" className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {jobs && (
        <>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.1em] text-muted">{jobs.length} offre{jobs.length > 1 ? "s" : ""}</p>
          {sources && !sources.jooble && !sources.adzuna && (
            <p className="mt-2 rounded-2xl bg-brand-soft px-4 py-3 text-sm text-brand-dark">Seules les offres en télétravail et européennes sont affichées pour l'instant : les offres sur site par pays arrivent bientôt.</p>
          )}
          <div className="mt-4 space-y-3">
            {jobs.map((j) => (
              <article key={j.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold">{j.title}</h2>
                    <p className="text-muted">{[j.company, j.location].filter(Boolean).join(" · ")}</p>
                    <p className="mt-2 flex flex-wrap gap-1.5 text-xs font-semibold">
                      {j.remote && <span className="rounded-full bg-[#d9f3e2] px-2.5 py-1 text-[#157a43]">Télétravail</span>}
                      <span className="rounded-full bg-cream px-2.5 py-1 text-muted">{j.source}</span>
                      {j.date && !Number.isNaN(Date.parse(j.date)) && <span className="rounded-full bg-cream px-2.5 py-1 text-muted">{new Date(j.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <a href={j.url} target="_blank" rel="noopener noreferrer" className="btn-ghost px-4 py-2.5">Voir l'annonce ↗</a>
                    <button className="btn-blue px-5 py-2.5" disabled={creating !== null} onClick={() => start(j)}>{creating === j.id ? "Création…" : "Lancer le parcours"}</button>
                  </div>
                </div>
                {j.description && (
                  <>
                    <p className={`mt-4 whitespace-pre-line text-sm leading-relaxed text-ink/80 ${open === j.id ? "" : "line-clamp-3"}`}>{j.description}</p>
                    {j.description.length > 260 && <button className="mt-1 text-sm font-semibold text-brand" onClick={() => setOpen(open === j.id ? null : j.id)}>{open === j.id ? "Réduire" : "Lire la suite"}</button>}
                  </>
                )}
              </article>
            ))}
          </div>
          {!jobs.length && <p className="mt-4 text-muted">Aucune offre trouvée. Essaie un intitulé plus court, en anglais, ou un autre pays.</p>}
        </>
      )}
    </div>
  );
}
