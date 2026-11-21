"use client";

import { useState } from "react";

export type ImportedJob = { jobTitle: string; company: string; jobDescription: string; url: string };

/** Champ « coller le lien de l'offre » : remplit le poste, l'entreprise et le texte. */
export function JobImport({ onImport }: { onImport: (job: ImportedJob) => void }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function run() {
    if (!url.trim() || loading) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/import-job", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.jobTitle) throw new Error(data?.error ?? "Import impossible. Colle le texte de l'offre.");
      onImport({ ...data, url: url.trim() });
      setMessage({ ok: true, text: "Offre importée. Vérifie les champs ci-dessous." });
    } catch (err) {
      setMessage({ ok: false, text: err instanceof TypeError ? "Import impossible. Colle le texte de l'offre." : (err as Error).message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl bg-brand-soft/60 p-3">
      <label className="label !mb-1.5 !text-brand-dark" htmlFor="import-url">Importer depuis un lien</label>
      <div className="flex gap-2">
        <input
          id="import-url"
          type="url"
          inputMode="url"
          className="input py-2.5"
          placeholder="https://… adresse de l'annonce"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              run();
            }
          }}
        />
        <button type="button" onClick={run} disabled={loading || !url.trim()} className="btn shrink-0 px-4 py-2.5">
          {loading ? "Lecture…" : "Importer"}
        </button>
      </div>
      {message && <p role="status" className={`mt-2 text-[13px] ${message.ok ? "text-brand-dark" : "text-red-700"}`}>{message.text}</p>}
    </div>
  );
}
