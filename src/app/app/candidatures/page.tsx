"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { JobImport } from "@/components/JobImport";
import { addDays, formatDate, isDue, today } from "@/lib/dates";
import { createClient } from "@/lib/supabase/client";

const STATUSES = [
  { id: "a_postuler", label: "À postuler", dot: "bg-muted/50" },
  { id: "postule", label: "Postulé", dot: "bg-brand" },
  { id: "entretien", label: "Entretien", dot: "bg-sun" },
  { id: "offre", label: "Offre", dot: "bg-[#22c55e]" },
  { id: "refus", label: "Refus", dot: "bg-coral" },
] as const;

type Application = {
  id: string;
  company: string;
  job_title: string;
  url: string | null;
  status: string;
  notes: string | null;
  applied_at: string | null;
  follow_up_at: string | null;
  created_at: string;
};
type Doc = { id: string; title: string; application_id: string | null };

const COLUMNS = "id, company, job_title, url, status, notes, applied_at, follow_up_at, created_at";
const safeUrl = (u: string | null) => (u && /^https?:\/\//i.test(u) ? u : null);

export default function Candidatures() {
  const [items, setItems] = useState<Application[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ job_title: "", company: "", url: "", notes: "" });
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const open = items.find((a) => a.id === openId) ?? null;

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("applications").select(COLUMNS).order("created_at", { ascending: false }),
      supabase.from("documents").select("id, title, application_id").not("application_id", "is", null),
    ]).then(([apps, documents]) => {
      setItems(apps.data ?? []);
      setDocs(documents.data ?? []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenId(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId]);

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
      .insert({ job_title: form.job_title, company: form.company, url: url || null, notes: form.notes || null })
      .select(COLUMNS)
      .single();
    if (error) setError(error.message);
    else {
      setItems((prev) => [data, ...prev]);
      setForm({ job_title: "", company: "", url: "", notes: "" });
      setAdding(false);
    }
  }

  async function update(id: string, patch: Partial<Application>) {
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    const { error } = await createClient().from("applications").update(patch).eq("id", id);
    if (error) setError("La modification n'a pas pu être enregistrée.");
  }

  function setStatus(a: Application, status: string) {
    const patch: Partial<Application> = { status };
    // Passage à « Postulé » : on date la candidature et on propose une relance à J+7.
    if (status === "postule" && !a.applied_at) {
      patch.applied_at = today();
      if (!a.follow_up_at) patch.follow_up_at = addDays(7);
    }
    if (status === "offre" || status === "refus") patch.follow_up_at = null;
    update(a.id, patch);
  }

  async function remove(id: string) {
    if (!confirm("Supprimer cette candidature ?")) return;
    setItems((prev) => prev.filter((a) => a.id !== id));
    setOpenId(null);
    await createClient().from("applications").delete().eq("id", id);
  }

  const sent = items.filter((a) => a.status !== "a_postuler");
  const answered = sent.filter((a) => a.status !== "postule");
  const stats = [
    { label: "Candidatures", value: items.length },
    { label: "Envoyées", value: sent.length },
    { label: "Taux de réponse", value: sent.length ? `${Math.round((answered.length / sent.length) * 100)} %` : "—" },
    { label: "Entretiens", value: items.filter((a) => a.status === "entretien" || a.status === "offre").length },
    { label: "À relancer", value: items.filter((a) => isDue(a.follow_up_at)).length },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Suivi</p>
          <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Mes candidatures</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost" onClick={() => setAdding(!adding)}>{adding ? "Fermer" : "Ajout rapide"}</button>
          <Link href="/app/postuler" className="btn-blue">+ Nouvelle offre</Link>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="card p-5 sm:p-5">
            <dd className="text-3xl font-semibold tracking-[-0.03em]">{s.value}</dd>
            <dt className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-muted">{s.label}</dt>
          </div>
        ))}
      </dl>

      {adding && (
        <form onSubmit={add} className="card mt-4 space-y-4">
          <JobImport onImport={(j) => setForm({ job_title: j.jobTitle, company: j.company, url: j.url, notes: j.jobDescription.slice(0, 4000) })} />
          <div className="grid gap-3 md:grid-cols-3">
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
              <input id="url" className="input" placeholder="https://" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            </div>
          </div>
          <button className="btn">Ajouter au suivi</button>
        </form>
      )}
      {error && <p role="alert" className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {STATUSES.map((s) => {
          const list = items.filter((a) => a.status === s.id);
          return (
            <section key={s.id} className="rounded-[24px] bg-white/60 p-3">
              <h2 className="flex items-center gap-2 px-1 pb-2 text-sm font-semibold">
                <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                {s.label}
                <span className="ml-auto rounded-full bg-cream px-2 py-0.5 text-xs">{list.length}</span>
              </h2>
              <div className="space-y-2">
                {list.map((a) => (
                  <article key={a.id} className="rounded-2xl bg-white p-3.5 shadow-[0_1px_2px_rgba(11,11,20,0.06)]">
                    <button className="block w-full text-left" onClick={() => setOpenId(a.id)}>
                      <p className="text-sm font-semibold">{a.job_title}</p>
                      <p className="text-sm text-muted">{a.company}</p>
                      <span className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold">
                        {a.follow_up_at && (
                          <span className={`rounded-full px-2 py-0.5 ${isDue(a.follow_up_at) ? "bg-[#ffe1ea] text-[#c2185b]" : "bg-brand-soft text-brand-dark"}`}>
                            Relance {formatDate(a.follow_up_at)}
                          </span>
                        )}
                        {docs.some((d) => d.application_id === a.id) && <span className="rounded-full bg-cream px-2 py-0.5 text-muted">Documents</span>}
                      </span>
                    </button>
                    <Link href={`/app/offres/${a.id}`} className="mt-2.5 inline-block text-[13px] font-semibold text-brand">Ouvrir le parcours →</Link>
                    <select aria-label="Statut" className="input mt-2 rounded-xl px-2 py-1.5 text-xs" value={a.status} onChange={(e) => setStatus(a, e.target.value)}>
                      {STATUSES.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>
                  </article>
                ))}
                {!list.length && <p className="px-1 py-3 text-xs text-muted">{loading ? "Chargement…" : "Rien ici."}</p>}
              </div>
            </section>
          );
        })}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-ink/30 backdrop-blur-sm" onClick={() => setOpenId(null)}>
          <aside role="dialog" aria-modal="true" aria-label="Détail de la candidature" className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl sm:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">{STATUSES.find((s) => s.id === open.status)?.label}</p>
                <h2 className="mt-2 text-2xl font-semibold">{open.job_title}</h2>
                <p className="text-muted">{open.company}</p>
              </div>
              <button aria-label="Fermer" className="btn-ghost h-10 w-10 shrink-0 p-0" onClick={() => setOpenId(null)}>✕</button>
            </div>
            {safeUrl(open.url) && (
              <a href={safeUrl(open.url)!} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm font-semibold text-brand">Voir l'offre ↗</a>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="applied">Candidature envoyée</label>
                <input id="applied" type="date" className="input" value={open.applied_at ?? ""} onChange={(e) => update(open.id, { applied_at: e.target.value || null })} />
              </div>
              <div>
                <label className="label" htmlFor="follow">Relancer le</label>
                <input id="follow" type="date" className="input" value={open.follow_up_at ?? ""} onChange={(e) => update(open.id, { follow_up_at: e.target.value || null })} />
              </div>
            </div>
            {isDue(open.follow_up_at) && (
              <p className="mt-3 rounded-2xl bg-[#ffe1ea] px-4 py-3 text-sm text-[#c2185b]">
                C'est le moment de relancer. <Link href="/app/outils/relance" className="font-semibold underline underline-offset-4">Rédiger la relance</Link>
              </p>
            )}

            <div className="mt-5">
              <label className="label" htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                rows={7}
                maxLength={8000}
                className="input"
                placeholder="Contact, salaire annoncé, questions posées en entretien…"
                defaultValue={open.notes ?? ""}
                key={open.id}
                onBlur={(e) => e.target.value !== (open.notes ?? "") && update(open.id, { notes: e.target.value || null })}
              />
              <p className="mt-1 text-xs text-muted">Enregistré automatiquement quand tu quittes le champ.</p>
            </div>

            <div className="mt-5">
              <p className="label">Documents liés</p>
              {docs.filter((d) => d.application_id === open.id).length ? (
                <ul className="space-y-1.5">
                  {docs.filter((d) => d.application_id === open.id).map((d) => (
                    <li key={d.id}><Link href="/app/documents" className="flex items-center gap-2 rounded-xl bg-cream px-3 py-2 text-sm font-medium"><span className="h-4 w-3 rounded-[3px] bg-brand" />{d.title}</Link></li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">Aucun document. Ouvre le parcours de cette offre pour rédiger le CV et la lettre.</p>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              <Link href={`/app/offres/${open.id}`} className="btn-blue px-4 py-2.5">Ouvrir le parcours</Link>
              <button className="btn-ghost px-4 py-2.5 hover:border-red-700 hover:text-red-700" onClick={() => remove(open.id)}>Supprimer</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
