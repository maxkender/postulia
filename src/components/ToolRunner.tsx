"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStream } from "@/lib/useStream";
import type { ToolField } from "@/lib/tools";
import { ErrorNote } from "./ErrorNote";
import { Markdown } from "./Markdown";

export function ToolRunner({ id, title, cta, fields }: { id: string; title: string; cta: string; fields: ToolField[] }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [status, setStatus] = useState("");
  const { output, busy, error, upgrade, run, stop } = useStream();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("");
    await run("/api/tool", { tool: id, values });
  }

  async function save() {
    const { error } = await createClient().from("documents").insert({ kind: "cv", title: `${title} — ${new Date().toLocaleDateString("fr-FR")}`, content: output });
    setStatus(error ? `Erreur : ${error.message}` : "Enregistré dans tes documents.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <form onSubmit={submit} className="card no-print h-fit space-y-4">
        {fields.map((f) => (
          <div key={f.id}>
            <label className="label" htmlFor={f.id}>{f.label}</label>
            {f.type === "textarea" ? (
              <textarea id={f.id} rows={f.rows ?? 6} maxLength={20000} required={f.required} placeholder={f.placeholder} className="input" value={values[f.id] ?? ""} onChange={(e) => setValues({ ...values, [f.id]: e.target.value })} />
            ) : (
              <input id={f.id} maxLength={300} required={f.required} placeholder={f.placeholder} className="input" value={values[f.id] ?? ""} onChange={(e) => setValues({ ...values, [f.id]: e.target.value })} />
            )}
          </div>
        ))}
        {busy ? (
          <button type="button" className="btn-ghost w-full py-3.5" onClick={stop}>Arrêter</button>
        ) : (
          <button className="btn-blue w-full py-3.5">{output ? "Relancer" : cta}</button>
        )}
        <ErrorNote error={error} upgrade={upgrade} />
      </form>

      <div>
        {output && !busy && (
          <div className="no-print mb-3 flex flex-wrap items-center gap-2">
            <button className="btn px-4 py-2" onClick={save}>Enregistrer</button>
            <button className="btn-ghost px-4 py-2" onClick={() => navigator.clipboard.writeText(output).then(() => setStatus("Copié."))}>Copier</button>
            <button className="btn-ghost px-4 py-2" onClick={() => window.print()}>Exporter en PDF</button>
            {status && <span className="text-sm text-muted">{status}</span>}
          </div>
        )}
        <div className="card print-area min-h-[28rem]">
          {!output && !busy && <p className="text-muted">Le résultat apparaîtra ici.</p>}
          {!output && busy && <p className="animate-pulse text-sm font-semibold uppercase tracking-[0.12em] text-brand">Analyse en cours…</p>}
          {output && <Markdown text={output} />}
        </div>
      </div>
    </div>
  );
}
