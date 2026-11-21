"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { OPTIONS, readPending, saveOnboarding, writePending, type Answers } from "@/lib/onboarding";
import { createClient } from "@/lib/supabase/client";
import { GoogleButton } from "./GoogleButton";
import { Logo } from "./Logo";

type StepId = "situation" | "approche" | "poste" | "experience" | "contrats" | "lieu" | "freins" | "parcours" | "compte";
const ORDER: StepId[] = ["situation", "approche", "poste", "experience", "contrats", "lieu", "freins", "parcours", "compte"];
const SECTIONS = [
  { label: "Toi", steps: ["situation", "approche"] },
  { label: "Ta recherche", steps: ["poste", "experience", "contrats", "lieu"] },
  { label: "Tes besoins", steps: ["freins", "parcours"] },
  { label: "Ton compte", steps: ["compte"] },
];

function Option({ selected, onClick, children }: { selected?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`w-full rounded-2xl border-2 bg-white px-6 py-4 text-lg font-medium shadow-[0_1px_2px_rgba(11,11,20,0.05)] transition duration-200 hover:-translate-y-0.5 hover:border-brand/60 sm:py-5 sm:text-xl ${selected ? "border-brand bg-brand-soft text-brand-dark" : "border-transparent"}`}
    >
      {children}
    </button>
  );
}

export function Onboarding({ mode }: { mode: "public" | "app" }) {
  const router = useRouter();
  const steps = mode === "public" ? ORDER : ORDER.filter((s) => s !== "compte");
  const sections = SECTIONS.filter((s) => mode === "public" || s.label !== "Ton compte");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const step = steps[index];

  // Reprend les réponses déjà données dans ce navigateur.
  useEffect(() => {
    const pending = readPending();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- lecture unique du stockage local au montage
    if (pending) setAnswers(pending);
  }, []);

  function set(patch: Answers, advance = false) {
    const next = { ...answers, ...patch };
    setAnswers(next);
    writePending(next);
    if (advance) setTimeout(() => setIndex((i) => Math.min(i + 1, steps.length - 1)), 180);
  }
  const toggle = (key: "contrats" | "freins", value: string) => {
    const list = answers[key] ?? [];
    set({ [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] });
  };
  const next = () => setIndex((i) => Math.min(i + 1, steps.length - 1));

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

  const lastBeforeAccount = step === "parcours";
  const continueLabel = lastBeforeAccount && mode === "app" ? (busy ? "Enregistrement…" : "Terminer") : "Continuer";
  const onContinue = lastBeforeAccount && mode === "app" ? finishInApp : next;

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
        <ol className="mt-5 flex gap-2" aria-label="Progression">
          {sections.map((section) => {
            const done = section.steps.filter((s) => steps.indexOf(s as StepId) < index).length;
            const pct = section.steps.includes(step) ? ((done + 0.5) / section.steps.length) * 100 : (done / section.steps.length) * 100;
            return (
              <li key={section.label} className="flex-1">
                <div className="h-2 overflow-hidden rounded-full bg-brand/15">
                  <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <p className={`mt-1.5 hidden text-[11px] font-semibold uppercase tracking-[0.1em] sm:block ${section.steps.includes(step) ? "text-brand" : "text-muted/60"}`}>{section.label}</p>
              </li>
            );
          })}
        </ol>
      </header>

      <main key={step} className="demo-pop relative mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-5 py-10 text-center">
        {step === "situation" && (
          <>
            <h1 className="text-balance text-3xl font-semibold sm:text-5xl">Quelle est ta situation aujourd'hui ?</h1>
            <div className="mt-9 space-y-3">{OPTIONS.situation.map((o) => <Option key={o} selected={answers.situation === o} onClick={() => set({ situation: o }, true)}>{o}</Option>)}</div>
          </>
        )}
        {step === "approche" && (
          <>
            <h1 className="text-balance text-3xl font-semibold sm:text-5xl">Où en es-tu dans ta recherche ?</h1>
            <div className="mt-9 space-y-3">{OPTIONS.approche.map((o) => <Option key={o} selected={answers.approche === o} onClick={() => set({ approche: o }, true)}>{o}</Option>)}</div>
          </>
        )}
        {step === "poste" && (
          <form onSubmit={(e) => { e.preventDefault(); next(); }}>
            <h1 className="text-balance text-3xl font-semibold sm:text-5xl">Quel poste recherches-tu ?</h1>
            <p className="mt-3 text-lg text-muted">Tu pourras en viser d'autres ensuite.</p>
            <input autoFocus required maxLength={120} aria-label="Poste recherché" className="input mt-8 py-4 text-center text-lg" placeholder="Ex. Cheffe de projet digital" value={answers.poste ?? ""} onChange={(e) => set({ poste: e.target.value })} />
            <button className="btn-blue mt-6 w-full py-4 text-base" disabled={!answers.poste?.trim()}>Continuer</button>
          </form>
        )}
        {step === "experience" && (
          <>
            <h1 className="text-balance text-3xl font-semibold sm:text-5xl">Combien d'années d'expérience as-tu ?</h1>
            <div className="mt-9 grid gap-3 sm:grid-cols-2">{OPTIONS.experience.map((o) => <Option key={o} selected={answers.experience === o} onClick={() => set({ experience: o }, true)}>{o}</Option>)}</div>
          </>
        )}
        {step === "contrats" && (
          <>
            <h1 className="text-balance text-3xl font-semibold sm:text-5xl">Quel type de contrat vises-tu ?</h1>
            <p className="mt-3 text-lg text-muted">Plusieurs réponses possibles.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">{OPTIONS.contrats.map((o) => <Option key={o} selected={answers.contrats?.includes(o)} onClick={() => toggle("contrats", o)}>{o}</Option>)}</div>
            <button type="button" className="btn-blue mt-6 w-full py-4 text-base" disabled={!answers.contrats?.length} onClick={next}>Continuer</button>
          </>
        )}
        {step === "lieu" && (
          <form onSubmit={(e) => { e.preventDefault(); next(); }}>
            <h1 className="text-balance text-3xl font-semibold sm:text-5xl">Où veux-tu travailler ?</h1>
            <input autoFocus required maxLength={120} aria-label="Ville ou région" className="input mt-8 py-4 text-center text-lg" placeholder="Ex. Lyon, ou France entière" value={answers.lieu ?? ""} onChange={(e) => set({ lieu: e.target.value })} />
            <div className="mt-4 grid grid-cols-3 gap-2">
              {OPTIONS.mode.map((o) => (
                <button key={o} type="button" aria-pressed={answers.mode === o} onClick={() => set({ mode: o })} className={`rounded-2xl border-2 bg-white px-2 py-3 text-sm font-semibold transition sm:text-base ${answers.mode === o ? "border-brand bg-brand-soft text-brand-dark" : "border-transparent"}`}>{o}</button>
              ))}
            </div>
            <button className="btn-blue mt-6 w-full py-4 text-base" disabled={!answers.lieu?.trim()}>Continuer</button>
          </form>
        )}
        {step === "freins" && (
          <>
            <h1 className="text-balance text-3xl font-semibold sm:text-5xl">Qu'est-ce qui te freine le plus ?</h1>
            <p className="mt-3 text-lg text-muted">Plusieurs réponses possibles.</p>
            <div className="mt-8 space-y-3">{OPTIONS.freins.map((o) => <Option key={o} selected={answers.freins?.includes(o)} onClick={() => toggle("freins", o)}>{o}</Option>)}</div>
            <button type="button" className="btn-blue mt-6 w-full py-4 text-base" disabled={!answers.freins?.length} onClick={next}>Continuer</button>
          </>
        )}
        {step === "parcours" && (
          <form onSubmit={(e) => { e.preventDefault(); onContinue(); }} className="text-left">
            <h1 className="text-balance text-center text-3xl font-semibold sm:text-5xl">Parle-nous de ton parcours</h1>
            <p className="mt-3 text-center text-lg text-muted">C'est la matière première de tes CV et de tes lettres. Colle ton CV actuel, même brouillon.</p>
            <label className="label mt-8" htmlFor="nom">Prénom et nom</label>
            <input id="nom" maxLength={120} autoComplete="name" className="input" value={answers.nom ?? ""} onChange={(e) => set({ nom: e.target.value })} />
            <label className="label mt-4" htmlFor="parcours">Ton parcours</label>
            <textarea id="parcours" rows={8} maxLength={20000} className="input" placeholder={"Expériences (poste, entreprise, dates, missions)\nFormation\nCompétences, langues"} value={answers.parcours ?? ""} onChange={(e) => set({ parcours: e.target.value })} />
            {error && <p role="alert" className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            <button className="btn-blue mt-6 w-full py-4 text-base" disabled={busy}>{continueLabel}</button>
            {!answers.parcours?.trim() && <p className="mt-3 text-center text-sm text-muted">Tu peux continuer sans le remplir et le compléter plus tard dans ton profil.</p>}
          </form>
        )}
        {step === "compte" && (
          <div className="mx-auto w-full max-w-md">
            <h1 className="text-balance text-3xl font-semibold sm:text-5xl">Ton espace est prêt</h1>
            <p className="mt-3 text-lg text-muted">Crée ton compte pour enregistrer tes réponses{answers.poste ? <> et préparer ta première candidature de <b className="text-ink">{answers.poste}</b></> : ""}.</p>
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
