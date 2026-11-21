"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Markdown } from "@/components/Markdown";

type Doc = { id: string; kind: string; title: string; content: string; created_at: string };

export default function Documents() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Doc | null>(null);

  useEffect(() => {
    createClient()
      .from("documents")
      .select("id, kind, title, content, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setDocs(data ?? []);
        setLoading(false);
      });
  }, []);

  async function remove(id: string) {
    if (!confirm("Supprimer ce document ?")) return;
    setDocs(docs.filter((d) => d.id !== id));
    if (open?.id === id) setOpen(null);
    await createClient().from("documents").delete().eq("id", id);
  }

  if (open) {
    return (
      <div>
        <div className="no-print mb-4 flex flex-wrap items-center gap-2">
          <button className="btn-ghost px-4 py-2" onClick={() => setOpen(null)}>← Retour</button>
          <button className="btn-ghost px-4 py-2" onClick={() => navigator.clipboard.writeText(open.content)}>Copier</button>
          <button className="btn px-4 py-2" onClick={() => window.print()}>Exporter en PDF</button>
        </div>
        <div className="card print-area mx-auto max-w-3xl">
          {open.kind === "cv" ? <Markdown text={open.content} /> : <div className="whitespace-pre-wrap text-sm leading-relaxed">{open.content}</div>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Mes documents</h1>
      <div className="mt-6 space-y-2">
        {docs.map((d) => (
          <div key={d.id} className="card flex flex-wrap items-center justify-between gap-3 py-4">
            <button className="text-left" onClick={() => setOpen(d)}>
              <p className="font-semibold">{d.title}</p>
              <p className="text-xs text-muted">{new Date(d.created_at).toLocaleDateString("fr-FR", { dateStyle: "long" })}</p>
            </button>
            <div className="flex gap-2">
              <button className="btn-ghost px-4 py-2" onClick={() => setOpen(d)}>Ouvrir</button>
              <button className="btn-ghost px-4 py-2 hover:border-red-700 hover:text-red-700" onClick={() => remove(d.id)}>Supprimer</button>
            </div>
          </div>
        ))}
        {!docs.length && <p className="text-muted">{loading ? "Chargement…" : "Aucun document pour l'instant. Génère un CV ou une lettre, puis clique sur « Enregistrer »."}</p>}
      </div>
    </div>
  );
}
