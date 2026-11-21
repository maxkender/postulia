"use client";

import Link from "next/link";
import { useState } from "react";
import { ErrorNote } from "@/components/ErrorNote";
import { Markdown } from "@/components/Markdown";
import { createClient } from "@/lib/supabase/client";

type Step = "idle" | "cv" | "letter" | "saving" | "done";

async function generate(kind: "cv" | "letter", job: Record<string, string>, onText: (t: string) => void) {
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, ...job }),
  });
  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => null);
    throw Object.assign(new Error(data?.error ?? "La génération a échoué. Réessaie dans un instant."), { upgrade: Boolean(data?.upgrade) });
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
    onText(text);
  }
  return text;
}

export default function Postuler() {
  const [job, setJob] = useState({ jobTitle: "", company: "", url: "", jobDescription: "" });
  const [step, setStep] = useState<Step>("idle");
  const [cv, setCv] = useState("");
  const [letter, setLetter] = useState("");
  const [tab, setTab] = useState<"cv" | "letter">("cv");
  const [error, setError] = useState("");
  const [upgrade, setUpgrade] = useState(false);
  const busy = step === "cv" || step === "letter" || step === "saving";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setUpgrade(false);
    const url = job.url.trim();
    if (url && !/^https?:\/\//i.test(url)) {
      setError("Le lien doit commencer par http:// ou https://");
      return;
    }
    setCv("");
    setLetter("");
    try {
      setStep("cv");
      setTab("cv");
      const cvText = await generate("cv", job, setCv);
      setStep("letter");
      setTab("letter");
      const letterText = await generate("letter", job, setLetter);
      setStep("saving");
      const supabase = createClient();
      const suffix = `${job.jobTitle}${job.company ? ` · ${job.company}` : ""}`;
      const { error: saveError } = await supabase.from("documents").insert([
        { kind: "cv", title: `CV — ${suffix}`, job_title: job.jobTitle, company: job.company || null, content: cvText },
        { kind: "letter", title: `Lettre — ${suffix}`, job_title: job.jobTitle, company: job.company || null, content: letterText },
      ]);
      const { error: appError } = await supabase.from("applications").insert({ job_title: job.jobTitle, company: job.company || "Entreprise non précisée", url: url || null });
      if (saveError || appError) throw new Error("Documents générés, mais l'enregistrement a échoué. Copie-les avant de quitter la page.");
      setStep("done");
    } catch (err) {
      setError(err instanceof TypeError ? "La génération a été interrompue. Réessaie dans un instant." : (err as Error).message);
      setUpgrade(Boolean((err as { upgrade?: boolean }).upgrade));
      setStep("idle");
    }
  }

  const steps = [
    { id: "cv", label: "CV adapté" },
    { id: "letter", label: "Lettre de motivation" },
    { id: "saving", label: "Enregistrement et suivi" },
  ];
  const order = ["idle", "cv", "letter", "saving", "done"];
  const shown = tab === "cv" ? cv : letter;

  return (
    <div>
      <p className="eyebrow no-print">Candidature express</p>
      <h1 className="no-print mt-3 text-4xl font-semibold sm:text-5xl">Une offre, un clic, un dossier complet</h1>
      <p className="no-print mb-8 mt-3 max-w-2xl text-lg text-muted">Colle l'annonce : Postulia rédige le CV et la lettre, les range dans tes documents et ajoute l'offre à ton suivi. Compte pour 2 générations.</p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <form onSubmit={submit} className="card no-print h-fit space-y-4">
          <div>
            <label className="label" htmlFor="job">Poste visé</label>
            <input id="job" required className="input" value={job.jobTitle} onChange={(e) => setJob({ ...job, jobTitle: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="company">Entreprise</label>
              <input id="company" className="input" value={job.company} onChange={(e) => setJob({ ...job, company: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="url">Lien de l'offre</label>
              <input id="url" className="input" placeholder="https://" value={job.url} onChange={(e) => setJob({ ...job, url: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="offer">Texte de l'offre</label>
            <textarea id="offer" required rows={9} maxLength={20000} className="input" placeholder="Colle l'annonce ici" value={job.jobDescription} onChange={(e) => setJob({ ...job, jobDescription: e.target.value })} />
          </div>
          <button className="btn-blue w-full py-3.5" disabled={busy}>{busy ? "Préparation en cours…" : "Préparer ma candidature"}</button>
          <ErrorNote error={error} upgrade={upgrade} />

          {step !== "idle" && (
            <ol className="space-y-2 pt-2">
              {steps.map((s) => {
                const state = order.indexOf(step) > order.indexOf(s.id) ? "done" : step === s.id ? "now" : "todo";
                return (
                  <li key={s.id} className="flex items-center gap-3 text-sm">
                    <span className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold ${state === "done" ? "bg-[#22c55e] text-white" : state === "now" ? "animate-pulse bg-brand text-white" : "bg-cream text-muted"}`}>{state === "done" ? "✓" : "•"}</span>
                    <span className={state === "todo" ? "text-muted" : "font-semibold"}>{s.label}</span>
                  </li>
                );
              })}
            </ol>
          )}
          {step === "done" && (
            <p className="rounded-2xl bg-brand-soft px-4 py-3 text-sm text-brand-dark">
              Dossier prêt. Retrouve-le dans <Link href="/app/documents" className="font-semibold underline underline-offset-4">Documents</Link> et dans ton <Link href="/app/candidatures" className="font-semibold underline underline-offset-4">suivi</Link>.
            </p>
          )}
        </form>

        <div>
          <div className="no-print mb-3 flex flex-wrap items-center gap-2">
            <div className="flex rounded-full bg-white p-1 shadow-[0_1px_2px_rgba(11,11,20,0.06)]">
              {(["cv", "letter"] as const).map((t) => (
                <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tab === t ? "bg-ink text-white" : "text-muted"}`}>
                  {t === "cv" ? "CV" : "Lettre"}
                </button>
              ))}
            </div>
            {shown && !busy && (
              <>
                <button className="btn-ghost px-4 py-2" onClick={() => navigator.clipboard.writeText(shown)}>Copier</button>
                <button className="btn-ghost px-4 py-2" onClick={() => window.print()}>Exporter en PDF</button>
              </>
            )}
          </div>
          <div className="card print-area min-h-[28rem]">
            {!shown && <p className={busy ? "animate-pulse text-sm font-semibold uppercase tracking-[0.12em] text-brand" : "text-muted"}>{busy ? "Rédaction en cours…" : `${tab === "cv" ? "Ton CV" : "Ta lettre"} apparaîtra ici.`}</p>}
            {shown && (tab === "cv" ? <Markdown text={shown} /> : <div className="whitespace-pre-wrap text-sm leading-relaxed">{shown}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
