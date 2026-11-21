"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CURRENCIES, REGIONS, countries } from "@/lib/countries";
import { OPTIONS, readPending, saveOnboarding, writePending, type Answers } from "@/lib/onboarding";
import { createClient } from "@/lib/supabase/client";
import { GoogleButton } from "./GoogleButton";
import { Logo } from "./Logo";
import { ToolIcon } from "./ToolIcon";

type StepId =
  | "situation" | "approche" | "duree" | "info-cible" | "info-main"
  | "aCv" | "parcours" | "objectifs" | "info-merci"
  | "ia" | "info-ia"
  | "poste" | "contrats" | "salaire" | "modes" | "lieux"
  | "compte";

const SECTIONS: { label: string; steps: StepId[] }[] = [
  { label: "Toi", steps: ["situation", "approche", "duree", "info-cible", "info-main"] },
  { label: "Ton parcours", steps: ["aCv", "parcours"] },
  { label: "Tes objectifs", steps: ["objectifs", "info-merci"] },
  { label: "L'IA et toi", steps: ["ia", "info-ia"] },
  { label: "Tes préférences", steps: ["poste", "contrats", "salaire", "modes", "lieux"] },
  { label: "Ton compte", steps: ["compte"] },
];

const IA_POINTS = [
  { icon: "spark", title: "Un CV réécrit pour chaque offre", text: "Tes expériences les plus pertinentes passent en premier." },
  { icon: "search", title: "Les mots-clés que les logiciels de tri attendent", text: "Avec un score de compatibilité avant d'envoyer." },
  { icon: "chat", title: "Des questions ciblées sur chaque poste", text: "Tes réponses enrichissent ton CV et ta lettre." },
  { icon: "mic", title: "Un entretien blanc avant le vrai", text: "Un recruteur IA te pose les questions du poste et te corrige." },
];

function Option({ selected, onClick, children }: { selected?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex w-full items-center gap-4 rounded-[20px] border-2 bg-white px-5 py-4 text-left text-lg font-medium shadow-[0_1px_2px_rgba(11,11,20,0.05)] transition duration-200 hover:-translate-y-0.5 hover:border-brand/50 sm:px-6 sm:py-[1.15rem] sm:text-xl ${selected ? "border-brand bg-brand-soft text-brand-dark" : "border-transparent"}`}
    >
      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 text-[11px] font-bold transition ${selected ? "border-brand bg-brand text-white" : "border-line text-transparent"}`}>✓</span>
      {children}
    </button>
  );
}

function Title({ children, sub }: { children: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <>
      <h1 className="text-balance text-3xl font-semibold leading-[1.1] sm:text-[2.75rem]">{children}</h1>
      {sub && <p className="mx-auto mt-3 max-w-lg text-lg text-muted">{sub}</p>}
    </>
  );
}

export function Onboarding({ mode }: { mode: "public" | "app" }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [countryQuery, setCountryQuery] = useState("");

  const sections = SECTIONS.filter((s) => mode === "public" || s.label !== "Ton compte");
  const steps = sections.flatMap((s) => s.steps);
  const step = steps[index];
  const section = sections.find((s) => s.steps.includes(step))!;
  const isLast = index === steps.length - 1;

  // Reprend les réponses déjà données dans ce navigateur.
  useEffect(() => {
    const pending = readPending();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture unique du stockage local au montage
    if (pending) setAnswers(pending);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [index]);

  function set(patch: Answers, advance = false) {
    const next = { ...answers, ...patch };
    setAnswers(next);
    writePending(next);
    if (advance) setTimeout(() => setIndex((i) => Math.min(i + 1, steps.length - 1)), 200);
  }
  function toggle(key: "objectifs" | "contrats" | "modes" | "lieux" | "pays", value: string) {
    const list = answers[key] ?? [];
    set({ [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] });
  }

  async function finishInApp() {
    setBusy(true);
    setError("");
    const { error } = await saveOnboarding(createClient(), answers);
    if (error) {
      setError("L'enregistrement a échoué. Réessaie.");
      setBusy(false);
    } else {
      router.replace("/app");
      router.refresh();
    }
  }
  const next = () => (isLast && mode === "app" ? finishInApp() : setIndex((i) => Math.min(i + 1, steps.length - 1)));

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    writePending(answers);
    const { data, error } = await createClient().auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback`, data: { full_name: answers.nom ?? "" } },
    });
    if (error) setError(error.message.includes("already") ? "Un compte existe déjà avec cet e-mail. Connecte-toi." : error.message);
    else if (data.session) {
      router.push("/app/bienvenue");
      router.refresh();
      return;
    } else setNotice("Compte créé. Clique sur le lien reçu par e-mail pour l'activer : tes réponses sont conservées.");
    setBusy(false);
  }

  const cont = (disabled = false) => (
    <button type="button" onClick={next} disabled={disabled || busy} className="btn-blue mt-7 w-full py-4 text-base">
      {busy ? "Enregistrement…" : isLast && mode === "app" ? "Terminer" : "Continuer"}
    </button>
  );
  const single = (key: "situation" | "approche" | "duree" | "aCv" | "ia") => (
    <div className="mt-9 space-y-3">
      {OPTIONS[key].map((o) => (
        <Option key={o} selected={answers[key] === o} onClick={() => set({ [key]: o }, true)}>{o}</Option>
      ))}
    </div>
  );
  const multi = (key: "objectifs" | "contrats" | "modes") => (
    <div className="mt-8 space-y-3">
      {OPTIONS[key].map((o) => (
        <Option key={o} selected={answers[key]?.includes(o)} onClick={() => toggle(key, o)}>{o}</Option>
      ))}
    </div>
  );
  const salary = answers.salaire ?? 35000;
  const currency = answers.devise ?? "EUR";
  const money = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  const query = countryQuery.trim().toLowerCase();
  const matches = query ? countries().filter((c) => c.name.toLowerCase().includes(query) && !answers.pays?.includes(c.name)).slice(0, 8) : [];
  const noCv = answers.aCv === OPTIONS.aCv[1];

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-brand/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 -right-32 h-[34rem] w-[34rem] rounded-full bg-coral/10 blur-3xl" />

      <header className="relative mx-auto w-full max-w-4xl px-5 pt-6">
        <div className="relative flex h-10 items-center justify-center">
          {index > 0 && (
            <button type="button" onClick={() => setIndex(index - 1)} className="absolute left-0 flex items-center gap-1.5 text-sm font-semibold text-muted transition hover:text-ink">
              <span aria-hidden>‹</span> Retour
            </button>
          )}
          <Logo href={mode === "public" ? "/" : "/app"} />
          {mode === "public" && <Link href="/connexion" className="absolute right-0 hidden text-sm font-semibold text-muted transition hover:text-ink sm:block">J'ai déjà un compte</Link>}
        </div>
        <ol className="mt-5 flex items-center gap-1.5" aria-label="Progression">
          {sections.map((s, n) => {
            const first = steps.indexOf(s.steps[0]);
            const done = Math.max(0, Math.min(s.steps.length, index - first));
            const pct = s === section ? ((done + 0.4) / s.steps.length) * 100 : (done / s.steps.length) * 100;
            return (
              <li key={s.label} className="flex flex-1 items-center gap-1.5">
                <span className={`h-3 w-3 shrink-0 rounded-full transition ${index >= first ? "bg-brand" : "bg-brand/15"}`} />
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-brand/15">
                  <span className="block h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${pct}%` }} />
                </span>
                {n === sections.length - 1 && <span className={`h-3 w-3 shrink-0 rounded-full ${isLast ? "bg-brand" : "bg-brand/15"}`} />}
              </li>
            );
          })}
        </ol>
      </header>

      <main key={step} className="demo-pop relative mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 py-10 text-center">
        {!step.startsWith("info") && step !== "compte" && index > 2 && <p className="eyebrow mb-4 self-center">{section.label}</p>}

        {step === "situation" && (<><Title>Quelle est ta situation professionnelle aujourd'hui ?</Title>{single("situation")}</>)}
        {step === "approche" && (<><Title>Comment abordes-tu ta recherche d'emploi en ce moment ?</Title>{single("approche")}</>)}
        {step === "duree" && (<><Title>Depuis combien de temps cherches-tu ?</Title>{single("duree")}</>)}

        {step === "info-cible" && (
          <>
            <div className="tile mx-auto grid h-20 w-20 place-items-center rounded-[28px] text-white"><ToolIcon name="search" className="h-9 w-9" /></div>
            <div className="mt-8"><Title sub="Les recruteurs et leurs logiciels de tri cherchent les mots de leur annonce. Un CV adapté à chaque offre a bien plus de chances d'être lu qu'un CV envoyé à l'identique partout.">Une candidature ciblée vaut mieux que dix candidatures identiques</Title></div>
            {cont()}
          </>
        )}
        {step === "info-main" && (
          <>
            <div className="tile-alt mx-auto grid h-20 w-20 place-items-center rounded-[28px] text-white"><ToolIcon name="bolt" className="h-9 w-9" /></div>
            <div className="mt-8"><Title sub="Analyse de l'annonce, CV, lettre, relance, préparation d'entretien : chaque offre devient un parcours guidé. Tu relis, tu valides, et c'est toi qui envoies.">Postulia prépare tout, tu gardes la main</Title></div>
            {cont()}
          </>
        )}

        {step === "aCv" && (<><Title>As-tu un CV sous la main ?</Title>{single("aCv")}</>)}
        {step === "parcours" && (
          <div className="text-left">
            <div className="text-center">
              <Title sub={noCv ? "Pas de souci : quelques lignes suffisent pour commencer, Postulia mettra tout en forme." : "Copie-colle son texte, même brouillon : il sert de base à tous tes documents."}>{noCv ? "Décris ton parcours en quelques lignes" : "Colle ton CV pour des documents sur mesure"}</Title>
            </div>
            <label className="label mt-8" htmlFor="nom">Prénom et nom</label>
            <input id="nom" maxLength={120} autoComplete="name" className="input" value={answers.nom ?? ""} onChange={(e) => set({ nom: e.target.value })} />
            <label className="label mt-4" htmlFor="parcours">{noCv ? "Ton parcours" : "Texte de ton CV"}</label>
            <textarea id="parcours" rows={8} maxLength={20000} className="input" placeholder={noCv ? "Études, stages, jobs, bénévolat, compétences, langues…" : "Expériences (poste, entreprise, dates, missions)\nFormation\nCompétences, langues"} value={answers.parcours ?? ""} onChange={(e) => set({ parcours: e.target.value })} />
            {cont()}
            {!answers.parcours?.trim() && <button type="button" onClick={next} className="mx-auto mt-3 block text-sm font-semibold text-muted underline-offset-4 hover:underline">Passer pour l'instant</button>}
          </div>
        )}
        {step === "objectifs" && (<><Title sub="Plusieurs réponses possibles.">Que recherches-tu ?</Title>{multi("objectifs")}{cont(!answers.objectifs?.length)}</>)}
        {step === "info-merci" && (
          <>
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#22c55e] text-4xl text-white">✓</div>
            <div className="mt-8"><Title sub="Encore quelques questions rapides, et ton espace sera réglé sur le poste que tu vises.">Merci, on y voit plus clair !</Title></div>
            {cont()}
          </>
        )}

        {step === "ia" && (<><Title>As-tu déjà utilisé l'IA pour t'aider dans ta recherche d'emploi ?</Title>{single("ia")}</>)}
        {step === "info-ia" && (
          <>
            <Title>Ce que l'IA fait pour toi dans Postulia</Title>
            <ul className="mt-8 space-y-3 text-left">
              {IA_POINTS.map((pt) => (
                <li key={pt.title} className="flex items-center gap-4 rounded-[20px] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(11,11,20,0.05)]">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand"><ToolIcon name={pt.icon} /></span>
                  <span>
                    <span className="block text-lg font-semibold leading-tight">{pt.title}</span>
                    <span className="block text-sm text-muted">{pt.text}</span>
                  </span>
                </li>
              ))}
            </ul>
            {cont()}
          </>
        )}

        {step === "poste" && (
          <form onSubmit={(e) => { e.preventDefault(); next(); }}>
            <Title sub="Tu pourras en viser d'autres ensuite.">Quel poste recherches-tu ?</Title>
            <input autoFocus required maxLength={120} aria-label="Poste recherché" className="input mt-8 py-4 text-center text-lg" placeholder="Ex. Cheffe de projet digital" value={answers.poste ?? ""} onChange={(e) => set({ poste: e.target.value })} />
            <button className="btn-blue mt-7 w-full py-4 text-base" disabled={!answers.poste?.trim()}>Continuer</button>
          </form>
        )}
        {step === "contrats" && (<><Title sub="Plusieurs réponses possibles.">Quel type de contrat t'intéresse ?</Title>{multi("contrats")}{cont(!answers.contrats?.length)}</>)}
        {step === "salaire" && (
          <>
            <Title sub="Brut par an. Cela reste entre toi et Postulia.">Quel salaire minimum vises-tu ?</Title>
            <div className="mt-8 flex justify-center">
              <select aria-label="Devise" value={currency} onChange={(e) => set({ devise: e.target.value })} className="input w-auto rounded-full py-2 pr-9 text-sm font-semibold">
                {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <p className="mt-5 text-5xl font-semibold tracking-[-0.03em] sm:text-6xl">{money(salary)}{salary >= 150000 ? " et plus" : ""}</p>
            <input type="range" min={0} max={150000} step={1000} value={salary} aria-label="Salaire minimum souhaité, brut par an" onChange={(e) => set({ salaire: Number(e.target.value) })} className="mt-8 w-full accent-[#5b4dff]" />
            <div className="mt-1 flex justify-between text-sm text-muted"><span>{money(0)}</span><span>{money(150000)} et plus</span></div>
            {cont()}
            <button type="button" onClick={() => { set({ salaire: null }); next(); }} className="mx-auto mt-3 block text-sm font-semibold text-muted underline-offset-4 hover:underline">Je préfère ne pas répondre</button>
          </>
        )}
        {step === "modes" && (<><Title sub="Plusieurs réponses possibles.">Quel mode de travail préfères-tu ?</Title>{multi("modes")}{cont(!answers.modes?.length)}</>)}
        {step === "lieux" && (
          <>
            <Title sub="Ajoute un ou plusieurs pays, ou toute une région du monde.">Où aimerais-tu travailler ?</Title>
            <div className="relative mt-8">
              <input aria-label="Rechercher un pays" autoComplete="off" className="input py-3.5 text-center text-lg" placeholder="Tape pour chercher un pays…" value={countryQuery} onChange={(e) => setCountryQuery(e.target.value)} />
              {matches.length > 0 && (
                <ul className="absolute inset-x-0 top-full z-10 mt-2 overflow-hidden rounded-2xl bg-white text-left shadow-[0_20px_40px_-18px_rgba(11,11,20,0.35)]">
                  {matches.map((c) => (
                    <li key={c.code}>
                      <button type="button" className="block w-full px-5 py-3 text-left text-base hover:bg-brand-soft" onClick={() => { toggle("pays", c.name); setCountryQuery(""); }}>{c.name}</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {Boolean(answers.pays?.length) && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {answers.pays!.map((c) => (
                  <button key={c} type="button" onClick={() => toggle("pays", c)} aria-label={`Retirer ${c}`} className="rounded-full border-2 border-brand bg-brand-soft px-4 py-2 text-base font-medium text-brand-dark">{c} <span aria-hidden>✕</span></button>
                ))}
              </div>
            )}
            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.1em] text-muted">Ou ajoute une région entière</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {REGIONS.map((o) => (
                <button key={o} type="button" aria-pressed={answers.lieux?.includes(o)} onClick={() => toggle("lieux", o)} className={`rounded-full border-2 px-4 py-2.5 text-base font-medium transition ${answers.lieux?.includes(o) ? "border-brand bg-brand-soft text-brand-dark" : "border-transparent bg-white shadow-[0_1px_2px_rgba(11,11,20,0.05)]"}`}>{o}</button>
              ))}
            </div>
            <input maxLength={120} aria-label="Ville (facultatif)" className="input mt-4 py-3.5 text-center" placeholder="Ville (facultatif)" value={answers.lieu ?? ""} onChange={(e) => set({ lieu: e.target.value })} />
            {error && <p role="alert" className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            {cont(!answers.lieux?.length && !answers.pays?.length && !answers.lieu?.trim())}
          </>
        )}

        {step === "compte" && (
          <div className="mx-auto w-full max-w-md">
            <Title sub={<>Crée ton compte pour enregistrer tes réponses{answers.poste ? <> et lancer ton premier parcours de <b className="text-ink">{answers.poste}</b></> : ""}.</>}>Ton espace est prêt</Title>
            <div className="card mt-8 text-left">
              <GoogleButton />
              <form onSubmit={signUp} className="space-y-4">
                <div>
                  <label className="label" htmlFor="email">E-mail</label>
                  <input id="email" type="email" required autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <label className="label" htmlFor="password">Mot de passe</label>
                  <input id="password" type="password" required minLength={8} autoComplete="new-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
                  <p className="mt-1.5 text-xs text-muted">8 caractères minimum.</p>
                </div>
                {error && <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
                {notice && <p role="status" className="rounded-2xl bg-brand-soft px-4 py-3 text-sm text-brand-dark">{notice}</p>}
                <button className="btn-blue w-full py-3.5" disabled={busy}>{busy ? "Un instant…" : "Créer mon compte gratuit"}</button>
              </form>
            </div>
            <p className="mt-4 text-sm text-muted">Sans carte bancaire · 3 générations offertes par jour</p>
          </div>
        )}
      </main>
    </div>
  );
}
