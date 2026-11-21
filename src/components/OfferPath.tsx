"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { addDays, formatDate, isDue, today } from "@/lib/dates";
import { createClient } from "@/lib/supabase/client";
import { useStream } from "@/lib/useStream";
import { ErrorNote } from "./ErrorNote";
import { Markdown } from "./Markdown";

type Question = { q: string; why?: string; a: string };
type Offer = {
  id: string;
  job_title: string;
  company: string;
  url: string | null;
  status: string;
  notes: string | null;
  description: string | null;
  analysis: string | null;
  questions: Question[] | null;
  follow_up_draft: string | null;
  interview_prep: string | null;
  applied_at: string | null;
  follow_up_at: string | null;
};
type Doc = { id: string; kind: string; content: string };

const COLUMNS = "id, job_title, company, url, status, notes, description, analysis, questions, follow_up_draft, interview_prep, applied_at, follow_up_at";
const STATUS_LABEL: Record<string, string> = { a_postuler: "À postuler", postule: "Postulé", entretien: "Entretien", offre: "Offre reçue", refus: "Refus" };
const safeUrl = (u: string | null) => (u && /^https?:\/\//i.test(u) ? u : null);

function Step({
  n,
  title,
  hint,
  done,
  open,
  onToggle,
  children,
}: {
  n: number;
  title: string;
  hint: string;
  done: boolean;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className={`card p-0 sm:p-0 ${open ? "ring-2 ring-brand/30" : ""}`}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="no-print flex w-full items-center gap-4 p-5 text-left sm:p-6">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold ${done ? "bg-[#22c55e] text-white" : open ? "bg-brand text-white" : "bg-cream text-muted"}`}>
          {done ? "✓" : n}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-semibold">{title}</span>
          <span className="block truncate text-sm text-muted">{hint}</span>
        </span>
        <svg viewBox="0 0 16 16" className={`h-4 w-4 shrink-0 text-muted transition ${open ? "rotate-180" : ""}`} aria-hidden>
          <path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <div className="border-t border-line p-5 sm:p-6">{children}</div>}
    </section>
  );
}

function Working({ label }: { label: string }) {
  return <p className="animate-pulse text-sm font-semibold uppercase tracking-[0.12em] text-brand">{label}</p>;
}

function Actions({ text, onRedo, redoLabel }: { text: string; onRedo: () => void; redoLabel: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="no-print mt-4 flex flex-wrap gap-2">
      <button className="btn-ghost px-4 py-2" onClick={() => navigator.clipboard.writeText(text).then(() => setCopied(true))}>{copied ? "Copié" : "Copier"}</button>
      <button className="btn-ghost px-4 py-2" onClick={() => window.print()}>Exporter en PDF</button>
      <button className="btn-ghost px-4 py-2" onClick={onRedo}>{redoLabel}</button>
    </div>
  );
}

export function OfferPath() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [missing, setMissing] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const [qBusy, setQBusy] = useState(false);
  const [qError, setQError] = useState("");
  const [saveError, setSaveError] = useState("");

  const analysis = useStream();
  const cv = useStream();
  const letter = useStream();
  const relance = useStream();
  const prep = useStream();

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("applications").select(COLUMNS).eq("id", id).maybeSingle(),
      supabase.from("documents").select("id, kind, content").eq("application_id", id).order("created_at", { ascending: false }),
    ]).then(([app, documents]) => {
      if (!app.data) return setMissing(true);
      const o = app.data as Offer;
      const d = (documents.data ?? []) as Doc[];
      setOffer(o);
      setDocs(d);
      // Ouvre la première étape qui reste à faire.
      const answered = (o.questions ?? []).some((x) => x.a?.trim());
      const first = !o.analysis ? 1 : !answered ? 2 : !d.some((x) => x.kind === "cv") ? 3 : !d.some((x) => x.kind === "letter") ? 4 : o.status === "a_postuler" ? 5 : o.status === "postule" ? 6 : 7;
      setOpen(first);
    });
  }, [id]);

  const update = useCallback(
    async (patch: Partial<Offer>) => {
      setOffer((prev) => (prev ? { ...prev, ...patch } : prev));
      const { error } = await createClient().from("applications").update(patch).eq("id", id);
      setSaveError(error ? "La modification n'a pas pu être enregistrée." : "");
    },
    [id],
  );

  if (missing) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg text-muted">Cette offre n'existe pas ou a été supprimée.</p>
        <Link href="/app/candidatures" className="btn mt-6">Retour au suivi</Link>
      </div>
    );
  }
  if (!offer) return <p className="py-20 text-center text-sm font-semibold uppercase tracking-[0.12em] text-brand">Chargement du parcours…</p>;

  const cvDoc = docs.find((d) => d.kind === "cv");
  const letterDoc = docs.find((d) => d.kind === "letter");
  const questions = offer.questions ?? [];
  const answeredCount = questions.filter((x) => x.a?.trim()).length;
  const applied = offer.status !== "a_postuler";
  const closed = offer.status === "offre" || offer.status === "refus";
  const done = [Boolean(offer.analysis), answeredCount > 0, Boolean(cvDoc), Boolean(letterDoc), applied, Boolean(offer.follow_up_draft) || offer.status === "entretien" || closed, Boolean(offer.interview_prep), closed];
  const progress = Math.round((done.filter(Boolean).length / done.length) * 100);
  const toggle = (n: number) => setOpen(open === n ? null : n);
  const suffix = `${offer.job_title} · ${offer.company}`;

  async function runAnalysis() {
    const text = await analysis.run("/api/offer", { id, action: "analysis" });
    if (text) await update({ analysis: text });
  }

  async function loadQuestions() {
    setQBusy(true);
    setQError("");
    try {
      const res = await fetch("/api/offer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "questions" }) });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.questions) throw new Error(data?.error ?? "Les questions n'ont pas pu être préparées.");
      setOffer((prev) => (prev ? { ...prev, questions: data.questions } : prev));
    } catch (err) {
      setQError(err instanceof TypeError ? "Connexion interrompue. Réessaie." : (err as Error).message);
    } finally {
      setQBusy(false);
    }
  }

  function answer(index: number, a: string) {
    const next = questions.map((x, i) => (i === index ? { ...x, a } : x));
    update({ questions: next });
  }

  async function generateDoc(kind: "cv" | "letter") {
    const stream = kind === "cv" ? cv : letter;
    const text = await stream.run("/api/generate", { kind, applicationId: id });
    if (!text) return;
    const supabase = createClient();
    await supabase.from("documents").delete().eq("application_id", id).eq("kind", kind);
    const { data, error } = await supabase
      .from("documents")
      .insert({ kind, title: `${kind === "cv" ? "CV" : "Lettre"} — ${suffix}`, job_title: offer!.job_title, company: offer!.company, content: text, application_id: id })
      .select("id, kind, content")
      .single();
    if (error) setSaveError("Le document est rédigé mais n'a pas pu être enregistré. Copie-le avant de quitter la page.");
    else setDocs((prev) => [data as Doc, ...prev.filter((d) => d.kind !== kind)]);
  }

  async function runRelance() {
    const contexte = offer!.applied_at
      ? `Candidature envoyée le ${formatDate(offer!.applied_at)}, sans réponse à ce jour.`
      : "Candidature envoyée récemment, sans réponse à ce jour.";
    const text = await relance.run("/api/tool", { tool: "relance", values: { poste: offer!.job_title, entreprise: offer!.company, contexte } });
    if (text) await update({ follow_up_draft: text });
  }

  async function runPrep() {
    const text = await prep.run("/api/tool", { tool: "questions", values: { poste: offer!.job_title, offre: offer!.description ?? "" } });
    if (text) await update({ interview_prep: text });
  }

  async function remove() {
    if (!confirm("Supprimer cette offre et son parcours ?")) return;
    await createClient().from("applications").delete().eq("id", id);
    router.push("/app/candidatures");
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="no-print">
        <Link href="/app/candidatures" className="text-sm font-semibold text-brand">← Toutes mes offres</Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="eyebrow">{STATUS_LABEL[offer.status] ?? offer.status}</p>
            <h1 className="mt-2 text-3xl font-semibold sm:text-5xl">{offer.job_title}</h1>
            <p className="mt-1 text-xl text-muted">{offer.company}</p>
          </div>
          {safeUrl(offer.url) && <a href={safeUrl(offer.url)!} target="_blank" rel="noopener noreferrer" className="btn-ghost">Voir l'annonce ↗</a>}
        </div>

        <div className="card mt-6 flex flex-wrap items-center gap-5 p-5 sm:p-5">
          <div className="min-w-[12rem] flex-1">
            <div className="flex items-baseline justify-between text-sm font-semibold">
              <span>Parcours de candidature</span>
              <span className="text-brand">{progress} %</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-brand/15">
              <div className="tile h-full rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
          </div>
          {offer.follow_up_at && !closed && (
            <p className={`rounded-full px-3 py-1.5 text-sm font-semibold ${isDue(offer.follow_up_at) ? "bg-[#ffe1ea] text-[#c2185b]" : "bg-brand-soft text-brand-dark"}`}>Relance le {formatDate(offer.follow_up_at)}</p>
          )}
        </div>
        {saveError && <p role="alert" className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{saveError}</p>}
      </div>

      <div className="mt-5 space-y-3">
        <Step n={1} title="Analyse de l'offre" hint={offer.analysis ? "Compatibilité, attentes du recruteur, écarts" : "Comprendre ce que le recruteur attend vraiment"} done={done[0]} open={open === 1} onToggle={() => toggle(1)}>
          {!offer.description?.trim() ? (
            <div>
              <label className="label" htmlFor="description">Texte de l'offre</label>
              <textarea id="description" rows={8} maxLength={20000} className="input" placeholder="Colle l'annonce ici pour lancer le parcours" onBlur={(e) => e.target.value.trim() && update({ description: e.target.value.trim() })} />
              <p className="mt-2 text-sm text-muted">Le texte est enregistré quand tu quittes le champ.</p>
            </div>
          ) : analysis.busy ? (
            analysis.output ? <Markdown text={analysis.output} /> : <Working label="Lecture de l'offre…" />
          ) : offer.analysis ? (
            <>
              <Markdown text={offer.analysis} />
              <div className="no-print mt-4 flex flex-wrap gap-2">
                <button className="btn-ghost px-4 py-2" onClick={runAnalysis}>Refaire l'analyse</button>
                <button className="btn-blue px-5 py-2" onClick={() => setOpen(2)}>Étape suivante →</button>
              </div>
            </>
          ) : (
            <div>
              <p className="text-muted">Postulia compare l'annonce à ton parcours : score de compatibilité, critères décisifs, atouts, écarts et stratégie pour cette offre.</p>
              <button className="btn-blue mt-4" onClick={runAnalysis}>Analyser l'offre</button>
            </div>
          )}
          <div className="mt-3"><ErrorNote error={analysis.error} upgrade={analysis.upgrade} /></div>
        </Step>

        <Step n={2} title="Questions ciblées" hint={questions.length ? `${answeredCount} réponse${answeredCount > 1 ? "s" : ""} sur ${questions.length}` : "Les précisions qui feront la différence pour cette offre"} done={done[1]} open={open === 2} onToggle={() => toggle(2)}>
          {questions.length ? (
            <>
              <p className="text-muted">Réponds en deux ou trois phrases. Tes réponses sont enregistrées et utilisées pour rédiger le CV et la lettre de cette offre.</p>
              <ol className="mt-5 space-y-5">
                {questions.map((x, i) => (
                  <li key={x.q}>
                    <label className="block font-semibold" htmlFor={`q${i}`}>{i + 1}. {x.q}</label>
                    {x.why && <p className="mt-1 text-sm text-muted">{x.why}</p>}
                    <textarea id={`q${i}`} rows={3} maxLength={2000} className="input mt-2" placeholder="Ta réponse (tu peux laisser vide)" defaultValue={x.a} onBlur={(e) => e.target.value !== x.a && answer(i, e.target.value)} />
                  </li>
                ))}
              </ol>
              <div className="no-print mt-5 flex flex-wrap gap-2">
                <button className="btn-ghost px-4 py-2" onClick={loadQuestions} disabled={qBusy}>{qBusy ? "Préparation…" : "Autres questions"}</button>
                <button className="btn-blue px-5 py-2" onClick={() => setOpen(3)}>Étape suivante →</button>
              </div>
            </>
          ) : (
            <div>
              <p className="text-muted">Postulia te pose cinq questions précises, tirées de cette annonce : preuves chiffrées, expérience liée à une exigence, motivation pour cette entreprise.</p>
              <button className="btn-blue mt-4" onClick={loadQuestions} disabled={qBusy || !offer.description?.trim()}>{qBusy ? "Préparation des questions…" : "Voir mes questions"}</button>
              {!offer.description?.trim() && <p className="mt-2 text-sm text-muted">Ajoute d'abord le texte de l'offre à l'étape 1.</p>}
            </div>
          )}
          {qError && <p role="alert" className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{qError}</p>}
        </Step>

        {([
          { n: 3, kind: "cv" as const, title: "CV adapté", hint: "Ton CV réécrit pour cette annonce", stream: cv, doc: cvDoc, cta: "Rédiger mon CV", wait: "Rédaction du CV…" },
          { n: 4, kind: "letter" as const, title: "Lettre de motivation", hint: "Une lettre écrite pour cette entreprise", stream: letter, doc: letterDoc, cta: "Rédiger ma lettre", wait: "Rédaction de la lettre…" },
        ]).map((s) => (
          <Step key={s.n} n={s.n} title={s.title} hint={s.doc ? "Prêt — tu peux le copier ou l'exporter" : s.hint} done={done[s.n - 1]} open={open === s.n} onToggle={() => toggle(s.n)}>
            {s.stream.busy ? (
              s.stream.output ? (s.kind === "cv" ? <Markdown text={s.stream.output} /> : <div className="whitespace-pre-wrap text-sm leading-relaxed">{s.stream.output}</div>) : <Working label={s.wait} />
            ) : s.doc ? (
              <>
                <div className="print-area">{s.kind === "cv" ? <Markdown text={s.doc.content} /> : <div className="whitespace-pre-wrap text-sm leading-relaxed">{s.doc.content}</div>}</div>
                <Actions text={s.doc.content} onRedo={() => generateDoc(s.kind)} redoLabel="Régénérer" />
                <button className="btn-blue no-print mt-3 px-5 py-2" onClick={() => setOpen(s.n + 1)}>Étape suivante →</button>
              </>
            ) : (
              <div>
                <p className="text-muted">{answeredCount ? `Rédigé à partir de ton parcours, de l'annonce et de tes ${answeredCount} réponse${answeredCount > 1 ? "s" : ""}.` : "Rédigé à partir de ton parcours et de l'annonce. Réponds aux questions ciblées pour un meilleur résultat."}</p>
                <button className="btn-blue mt-4" onClick={() => generateDoc(s.kind)}>{s.cta}</button>
              </div>
            )}
            <div className="mt-3"><ErrorNote error={s.stream.error} upgrade={s.stream.upgrade} /></div>
          </Step>
        ))}

        <Step n={5} title="Envoi de la candidature" hint={applied ? `Envoyée${offer.applied_at ? ` le ${formatDate(offer.applied_at)}` : ""}` : "Dernières vérifications, puis tu postules"} done={done[4]} open={open === 5} onToggle={() => toggle(5)}>
          <ul className="space-y-2">
            {[
              { ok: Boolean(cvDoc), t: "CV adapté prêt" },
              { ok: Boolean(letterDoc), t: "Lettre de motivation prête" },
              { ok: applied, t: "Candidature envoyée sur le site de l'entreprise" },
            ].map((c) => (
              <li key={c.t} className="flex items-center gap-3">
                <span className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold ${c.ok ? "bg-[#22c55e] text-white" : "bg-cream text-muted"}`}>{c.ok ? "✓" : "•"}</span>
                {c.t}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted">Postulia ne postule pas à ta place : exporte tes documents, dépose-les sur l'annonce, puis reviens le noter ici.</p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            {!applied ? (
              <button className="btn-blue" onClick={() => { update({ status: "postule", applied_at: today(), follow_up_at: addDays(7) }); setOpen(6); }}>J'ai postulé</button>
            ) : (
              <>
                <div>
                  <label className="label" htmlFor="applied">Envoyée le</label>
                  <input id="applied" type="date" className="input" value={offer.applied_at ?? ""} onChange={(e) => update({ applied_at: e.target.value || null })} />
                </div>
                <div>
                  <label className="label" htmlFor="follow">Relancer le</label>
                  <input id="follow" type="date" className="input" value={offer.follow_up_at ?? ""} onChange={(e) => update({ follow_up_at: e.target.value || null })} />
                </div>
              </>
            )}
          </div>
        </Step>

        <Step n={6} title="Relance" hint={offer.follow_up_draft ? "E-mail de relance prêt" : offer.follow_up_at ? `Prévue le ${formatDate(offer.follow_up_at)}` : "Un e-mail court si tu n'as pas de réponse"} done={done[5]} open={open === 6} onToggle={() => toggle(6)}>
          {relance.busy ? (
            relance.output ? <Markdown text={relance.output} /> : <Working label="Rédaction de la relance…" />
          ) : offer.follow_up_draft ? (
            <>
              <Markdown text={offer.follow_up_draft} />
              <Actions text={offer.follow_up_draft} onRedo={runRelance} redoLabel="Régénérer" />
              <button className="btn-ghost no-print mt-3 px-4 py-2" onClick={() => update({ follow_up_at: addDays(7) })}>Relance envoyée, me le rappeler dans 7 jours</button>
            </>
          ) : (
            <div>
              <p className="text-muted">{isDue(offer.follow_up_at) ? "C'est le moment de relancer." : "Sans réponse au bout d'une semaine, une relance courte et polie augmente tes chances d'être lu."}</p>
              <button className="btn-blue mt-4" onClick={runRelance} disabled={!applied}>Rédiger la relance</button>
              {!applied && <p className="mt-2 text-sm text-muted">Disponible après l'envoi de la candidature.</p>}
            </div>
          )}
          <div className="mt-3"><ErrorNote error={relance.error} upgrade={relance.upgrade} /></div>
        </Step>

        <Step n={7} title="Préparation de l'entretien" hint={offer.interview_prep ? "Questions probables prêtes" : "Les questions de ce poste, et un entretien blanc"} done={done[6]} open={open === 7} onToggle={() => toggle(7)}>
          {prep.busy ? (
            prep.output ? <Markdown text={prep.output} /> : <Working label="Préparation des questions…" />
          ) : offer.interview_prep ? (
            <>
              <Markdown text={offer.interview_prep} />
              <Actions text={offer.interview_prep} onRedo={runPrep} redoLabel="Régénérer" />
            </>
          ) : (
            <p className="text-muted">Dix questions probables pour ce poste, avec des pistes de réponse tirées de ton parcours.</p>
          )}
          <div className="no-print mt-4 flex flex-wrap gap-2">
            {!offer.interview_prep && !prep.busy && <button className="btn-blue" onClick={runPrep}>Préparer mes questions</button>}
            <Link href={`/app/entretien?offre=${offer.id}`} className="btn-ghost">Lancer un entretien blanc</Link>
            {offer.status === "postule" && <button className="btn-ghost" onClick={() => update({ status: "entretien", follow_up_at: null })}>J'ai décroché un entretien</button>}
          </div>
          <div className="mt-3"><ErrorNote error={prep.error} upgrade={prep.upgrade} /></div>
        </Step>

        <Step n={8} title="Résultat et notes" hint={closed ? STATUS_LABEL[offer.status] : "Où en est cette offre"} done={done[7]} open={open === 8} onToggle={() => toggle(8)}>
          <p className="label">Statut</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <button key={value} type="button" aria-pressed={offer.status === value} onClick={() => update({ status: value, ...(value === "offre" || value === "refus" ? { follow_up_at: null } : {}) })} className={`rounded-full border-2 px-4 py-2 text-sm font-semibold transition ${offer.status === value ? "border-brand bg-brand-soft text-brand-dark" : "border-line bg-white"}`}>
                {label}
              </button>
            ))}
          </div>
          <label className="label mt-5" htmlFor="notes">Notes</label>
          <textarea id="notes" rows={5} maxLength={8000} className="input" placeholder="Interlocuteurs, salaire annoncé, questions posées en entretien, prochaines étapes…" defaultValue={offer.notes ?? ""} onBlur={(e) => e.target.value !== (offer.notes ?? "") && update({ notes: e.target.value || null })} />
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/app/contacts" className="btn-ghost px-4 py-2">Ajouter un contact</Link>
            <button className="btn-ghost px-4 py-2 hover:border-red-700 hover:text-red-700" onClick={remove}>Supprimer l'offre</button>
          </div>
        </Step>
      </div>
    </div>
  );
}
