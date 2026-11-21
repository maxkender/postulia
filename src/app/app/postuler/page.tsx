"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { JobImport } from "@/components/JobImport";
import { createClient } from "@/lib/supabase/client";

const STEPS = ["Analyse de l'offre", "Questions ciblées", "CV adapté", "Lettre de motivation", "Envoi", "Relance", "Entretien", "Résultat"];

export default function Postuler() {
  const router = useRouter();
  const [job, setJob] = useState({ jobTitle: "", company: "", url: "", jobDescription: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const url = job.url.trim();
    if (url && !/^https?:\/\//i.test(url)) {
      setError("Le lien doit commencer par http:// ou https://");
      return;
    }
    setBusy(true);
    const { data, error } = await createClient()
      .from("applications")
      .insert({ job_title: job.jobTitle.trim(), company: job.company.trim() || "Entreprise non précisée", url: url || null, description: job.jobDescription.trim() })
      .select("id")
      .single();
    if (error || !data) {
      setError("L'offre n'a pas pu être enregistrée. Réessaie.");
      setBusy(false);
      return;
    }
    router.push(`/app/offres/${data.id}`);
  }

  return (
    <div>
      <p className="eyebrow">Nouvelle offre</p>
      <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Une offre, un parcours sur mesure</h1>
      <p className="mb-8 mt-3 max-w-2xl text-lg text-muted">Colle une annonce : Postulia l'analyse, te pose les questions qui comptent pour ce poste, rédige ton CV et ta lettre, puis t'accompagne jusqu'à l'entretien.</p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <form onSubmit={submit} className="card h-fit space-y-4">
          <JobImport onImport={(j) => setJob({ jobTitle: j.jobTitle, company: j.company, url: j.url, jobDescription: j.jobDescription })} />
          <div>
            <label className="label" htmlFor="job">Poste visé</label>
            <input id="job" required maxLength={200} className="input" value={job.jobTitle} onChange={(e) => setJob({ ...job, jobTitle: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="company">Entreprise</label>
              <input id="company" maxLength={200} className="input" value={job.company} onChange={(e) => setJob({ ...job, company: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="url">Lien de l'offre</label>
              <input id="url" className="input" placeholder="https://" value={job.url} onChange={(e) => setJob({ ...job, url: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="offer">Texte de l'offre</label>
            <textarea id="offer" required rows={11} maxLength={20000} className="input" placeholder="Colle l'annonce ici" value={job.jobDescription} onChange={(e) => setJob({ ...job, jobDescription: e.target.value })} />
          </div>
          <button className="btn-blue w-full py-3.5" disabled={busy}>{busy ? "Création du parcours…" : "Créer mon parcours"}</button>
          {error && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        </form>

        <aside className="relative h-fit overflow-hidden rounded-[28px] bg-ink p-7 text-white">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-brand/70 blur-3xl" />
          <div className="relative">
            <p className="eyebrow !text-white/60">Ton parcours pour cette offre</p>
            <ol className="mt-5 space-y-3">
              {STEPS.map((s, i) => (
                <li key={s} className="flex items-center gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/15 text-xs font-bold">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
