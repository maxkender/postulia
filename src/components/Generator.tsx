"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { JobImport } from "./JobImport";
import { Markdown } from "./Markdown";

type Kind = "cv" | "letter";

export function Generator({ kind }: { kind: Kind }) {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [output, setOutput] = useState("");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [upgrade, setUpgrade] = useState(false);
  const [status, setStatus] = useState("");
  const abort = useRef<AbortController | null>(null);

  const label = kind === "cv" ? "CV" : "lettre de motivation";

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setUpgrade(false);
    setStatus("");
    setOutput("");
    setEditing(false);
    abort.current = new AbortController();
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, jobTitle, company, jobDescription, instructions }),
        signal: abort.current.signal,
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        setUpgrade(Boolean(data?.upgrade));
        throw new Error(data?.error ?? "La génération a échoué. Réessaie dans un instant.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setOutput(text);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError(err instanceof TypeError ? "La génération a été interrompue. Réessaie dans un instant." : (err as Error).message);
      }
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    const title = `${kind === "cv" ? "CV" : "Lettre"} — ${jobTitle}${company ? ` · ${company}` : ""}`;
    const { error } = await createClient()
      .from("documents")
      .insert({ kind, title, job_title: jobTitle, company: company || null, content: output });
    setStatus(error ? `Erreur : ${error.message}` : "Enregistré dans tes documents.");
  }

  async function copy() {
    await navigator.clipboard.writeText(output);
    setStatus("Copié.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <form onSubmit={generate} className="card no-print h-fit space-y-4">
        <JobImport
          onImport={(j) => {
            setJobTitle(j.jobTitle);
            setCompany(j.company);
            setJobDescription(j.jobDescription);
          }}
        />
        <div>
          <label className="label" htmlFor="job">Poste visé</label>
          <input id="job" required className="input" placeholder="Ex. Chargé de communication" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="company">Entreprise</label>
          <input id="company" className="input" value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="offer">Texte de l'offre</label>
          <textarea id="offer" rows={9} maxLength={20000} className="input" placeholder="Colle l'annonce ici" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="extra">Consignes (facultatif)</label>
          <input id="extra" className="input" maxLength={1000} placeholder="Ex. ton plus direct, insister sur le management" value={instructions} onChange={(e) => setInstructions(e.target.value)} />
        </div>
        {busy ? (
          <button type="button" className="btn-ghost w-full" onClick={() => abort.current?.abort()}>Arrêter</button>
        ) : (
          <button className="btn-blue w-full py-3.5">{output ? "Régénérer" : `Générer ${kind === "cv" ? "mon CV" : "ma lettre"}`}</button>
        )}
        {error && (
          <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}{" "}
            {upgrade && <Link href="/app/abonnement" className="font-medium underline underline-offset-4">Voir l'offre Pro</Link>}
          </p>
        )}
      </form>

      <div>
        {output && !busy && (
          <div className="no-print mb-3 flex flex-wrap items-center gap-2">
            <button className="btn px-4 py-2" onClick={save}>Enregistrer</button>
            <button className="btn-ghost px-4 py-2" onClick={copy}>Copier</button>
            <button className="btn-ghost px-4 py-2" onClick={() => window.print()}>Exporter en PDF</button>
            <button className="btn-ghost px-4 py-2" onClick={() => setEditing(!editing)}>{editing ? "Aperçu" : "Modifier"}</button>
            {status && <span className="text-sm text-muted">{status}</span>}
          </div>
        )}
        <div className="card print-area min-h-[28rem]">
          {!output && !busy && <p className="text-muted">Ta {label} apparaîtra ici.</p>}
          {!output && busy && <p className="animate-pulse font-mono text-xs uppercase tracking-[0.16em] text-brand">Rédaction en cours…</p>}
          {output && editing && (
            <textarea className="input min-h-[32rem] font-mono text-[13px]" value={output} onChange={(e) => setOutput(e.target.value)} />
          )}
          {output && !editing && (kind === "cv" ? <Markdown text={output} /> : <div className="whitespace-pre-wrap text-sm leading-relaxed">{output}</div>)}
        </div>
      </div>
    </div>
  );
}
