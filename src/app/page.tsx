import Link from "next/link";
import { Logo, Mark } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";

const stats = [
  { value: "1", label: "Profil pour tous tes documents" },
  { value: "2", label: "Documents par offre : CV + lettre" },
  { value: "5", label: "Étapes de suivi" },
  { value: "0", label: "Expérience inventée" },
];

const marquee = ["CV sur mesure", "Lettre de motivation", "Suivi des candidatures", "Export PDF", "Mots-clés de l'offre"];

const steps = [
  { n: "01", title: "Décris ton parcours", text: "Une seule fois : expériences, formation, compétences. Tu peux simplement coller ton CV actuel." },
  { n: "02", title: "Colle une offre", text: "Le poste, l'entreprise et le texte de l'annonce suffisent à Postulia pour cibler ta candidature." },
  { n: "03", title: "Relis et envoie", text: "Ton CV et ta lettre s'écrivent sous tes yeux. Tu ajustes, tu exportes en PDF, tu postules." },
];

const faq = [
  {
    q: "Est-ce que l'IA invente des expériences ?",
    a: "Non. Postulia travaille uniquement à partir du parcours que tu fournis. S'il manque une information, il laisse un repère entre crochets pour que tu la complètes.",
  },
  {
    q: "Quelle différence entre Gratuit et Pro ?",
    a: "L'offre gratuite donne 3 générations par jour, avec le suivi des candidatures et l'export PDF. Pro monte à 50 générations par jour, pour postuler à grande échelle.",
  },
  {
    q: "Puis-je annuler mon abonnement ?",
    a: "Oui, à tout moment depuis ton espace, en un clic. Tu gardes l'accès Pro jusqu'à la fin de la période payée.",
  },
  {
    q: "Mes données sont-elles privées ?",
    a: "Ton profil, tes documents et tes candidatures ne sont visibles que par toi, depuis ton compte.",
  },
];

function Diamond({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`inline-block rotate-45 rounded-[3px] ${className}`} />;
}

function Check() {
  return (
    <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden>
      <path d="M3 8.5l3.2 3.2L13 4.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Lines({ widths, className = "bg-ink/10" }: { widths: number[]; className?: string }) {
  return (
    <div className="space-y-2">
      {widths.map((w, i) => (
        <div key={i} className={`h-1.5 rounded-full ${className}`} style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[540px]" aria-hidden>
      {/* Disque et orbites */}
      <div className="absolute inset-[6%] rounded-full border border-white bg-gradient-to-br from-white/70 via-brand-soft/60 to-violet/10 shadow-[0_40px_120px_-30px_rgba(10,77,255,0.35)] backdrop-blur-sm" />
      <div className="absolute inset-[22%] animate-spin-slow rounded-full border border-dashed border-ink/25" />
      <div className="absolute inset-[6%] animate-spin-slow">
        <Diamond className="absolute left-1/2 top-0 h-3.5 w-3.5 -translate-y-1/2 bg-cyan" />
        <Diamond className="absolute right-[3%] top-[58%] h-3.5 w-3.5 bg-coral" />
        <Diamond className="absolute bottom-[11%] left-[12%] h-3.5 w-3.5 bg-sun" />
      </div>

      {/* Marque centrale */}
      <div className="absolute inset-0 grid place-items-center">
        <Mark className="h-[38%] w-[38%] drop-shadow-[0_24px_40px_rgba(10,77,255,0.35)]" />
      </div>

      {/* Carte CV */}
      <div className="absolute left-0 top-[9%] w-[41%] animate-float">
        <div className="glass rounded-3xl p-4">
          <div className="flex items-center gap-2.5">
            <span className="h-8 w-8 rounded-full bg-gradient-to-br from-brand to-violet" />
            <div className="flex-1">
              <div className="h-2 w-3/4 rounded-full bg-ink/80" />
              <div className="mt-1.5 h-1.5 w-1/2 rounded-full bg-ink/20" />
            </div>
          </div>
          <div className="mt-4">
            <Lines widths={[100, 86, 94]} />
          </div>
          <div className="mt-3 flex gap-1.5">
            <span className="h-4 w-10 rounded-full bg-brand-soft" />
            <span className="h-4 w-14 rounded-full bg-brand-soft" />
            <span className="h-4 w-8 rounded-full bg-brand-soft" />
          </div>
        </div>
        <p className="mt-2.5 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
          <span className="glass rounded-full px-2.5 py-1">CV ciblé</span>
        </p>
      </div>

      {/* Carte lettre */}
      <div className="absolute right-0 top-[4%] w-[36%] animate-float [animation-delay:-2.5s]">
        <div className="rounded-3xl bg-ink p-4 text-white shadow-[0_24px_60px_-20px_rgba(0,17,61,0.7)]">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/50">Objet</p>
          <div className="mt-2 h-2 w-5/6 rounded-full bg-white/90" />
          <div className="mt-4">
            <Lines widths={[100, 92, 97, 60]} className="bg-white/25" />
          </div>
          <div className="mt-3 h-1.5 w-8 rounded-full bg-cyan" />
        </div>
        <p className="mt-2.5 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
          <span className="glass rounded-full px-2.5 py-1">Lettre</span>
        </p>
      </div>

      {/* Carte suivi */}
      <div className="absolute bottom-[3%] right-[10%] w-[46%] animate-float [animation-delay:-4.5s]">
        <div className="glass rounded-3xl p-4">
          {[
            { c: "bg-sun", t: "Entretien", w: "w-16" },
            { c: "bg-brand", t: "Postulé", w: "w-20" },
            { c: "bg-violet", t: "Offre", w: "w-12" },
          ].map((r) => (
            <div key={r.t} className="flex items-center gap-2.5 py-1.5">
              <Diamond className={`h-2 w-2 ${r.c}`} />
              <span className={`h-1.5 rounded-full bg-ink/20 ${r.w}`} />
              <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[10px] font-medium shadow-sm">{r.t}</span>
            </div>
          ))}
        </div>
        <p className="mt-2.5 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
          <span className="glass rounded-full px-2.5 py-1">Suivi</span>
        </p>
      </div>
    </div>
  );
}

function MarqueeRow({ outline = false }: { outline?: boolean }) {
  const items = [...marquee, ...marquee, ...marquee, ...marquee];
  return (
    <div className="flex overflow-hidden">
      <div className={`flex shrink-0 items-center gap-8 pr-8 ${outline ? "animate-marquee-reverse" : "animate-marquee"}`}>
        {items.map((m, i) => (
          <span key={i} className="flex items-center gap-8 whitespace-nowrap">
            <span className={`text-4xl font-medium tracking-[-0.04em] sm:text-6xl ${outline ? "text-outline" : ""}`}>{m}</span>
            <Mark className={`h-7 w-7 sm:h-9 sm:w-9 ${outline ? "opacity-40" : ""}`} />
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="overflow-x-clip">
      <div className="rainbow fixed inset-x-0 top-0 z-50 h-[3px]" />

      {/* Navigation */}
      <header className="fixed inset-x-0 top-0 z-40">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between px-5 py-5 sm:px-8">
          <div className="glass rounded-full px-4 py-2">
            <Logo />
          </div>
          <nav className="glass flex items-center gap-1 rounded-full p-1.5 text-sm">
            <a href="#fonctionnalites" className="hidden rounded-full px-4 py-2 text-ink/80 transition hover:text-ink md:block">
              Fonctionnalités <sup className="font-mono text-[9px] text-muted">01</sup>
            </a>
            <a href="#tarifs" className="hidden rounded-full px-4 py-2 text-ink/80 transition hover:text-ink md:block">
              Tarifs <sup className="font-mono text-[9px] text-muted">02</sup>
            </a>
            <Link href="/connexion" className="hidden rounded-full px-4 py-2 text-ink/80 transition hover:text-ink sm:block">
              Se connecter
            </Link>
            <Link href="/connexion?mode=inscription" className="btn-blue px-5 py-2.5">
              Commencer
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative">
          <div className="aurora" />
          <div className="relative mx-auto grid max-w-[1320px] items-center gap-12 px-5 pb-16 pt-36 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:pb-24 lg:pt-44">
            <div>
              <p className="eyebrow">Assistant de candidature · IA</p>
              <h1 className="mt-6 text-[clamp(2.9rem,7vw,5.25rem)] font-medium leading-[0.98] tracking-[-0.045em]">
                Une candidature
                <br />
                sur mesure,
                <br />
                <span className="text-gradient">à chaque offre.</span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
                Postulia rédige ton CV et ta lettre de motivation à partir de ton parcours et de l'annonce, puis t'aide à
                suivre toutes tes candidatures au même endroit.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/connexion?mode=inscription" className="btn px-7 py-4 text-base">
                  Créer mon compte
                </Link>
                <a href="#fonctionnement" className="btn-ghost px-7 py-4 text-base">
                  Comment ça marche
                </a>
              </div>
              <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Gratuit pour commencer · Sans carte bancaire</p>
            </div>
            <HeroVisual />
          </div>

          <div className="relative mx-auto max-w-[1320px] px-5 sm:px-8">
            <dl className="grid grid-cols-2 border-t border-ink/15 lg:grid-cols-4">
              {stats.map((s, i) => (
                <div key={s.label} className={`py-7 pr-4 ${i % 2 ? "pl-6 border-l border-ink/15" : ""} ${i > 1 ? "border-t border-ink/15 lg:border-t-0" : ""} ${i === 2 ? "lg:border-l lg:pl-6" : ""}`}>
                  <dd className="text-4xl font-medium tracking-[-0.05em]">{s.value}</dd>
                  <dt className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Bandeau défilant */}
        <section className="space-y-3 py-20 sm:py-28" aria-hidden>
          <MarqueeRow />
          <MarqueeRow outline />
        </section>

        {/* Fonctionnalités */}
        <section id="fonctionnalites" className="mx-auto max-w-[1320px] scroll-mt-28 px-5 sm:px-8">
          <Reveal>
            <p className="eyebrow">Fonctionnalités</p>
            <h2 className="mt-5 max-w-3xl text-4xl font-medium leading-[1.05] sm:text-6xl">
              Moins de temps à rédiger. <span className="text-muted">Plus de temps pour préparer tes entretiens.</span>
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-5 lg:grid-cols-6">
            <Reveal className="lg:col-span-4">
              <article className="card relative h-full overflow-hidden p-8 sm:p-10">
                <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-brand/15 blur-3xl" />
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand">01 — CV</p>
                <h3 className="mt-4 text-3xl font-medium sm:text-4xl">Un CV réécrit pour l'offre que tu vises</h3>
                <p className="mt-3 max-w-md text-muted">
                  Colle l'annonce : Postulia réorganise ton parcours et reprend les mots-clés du poste, pour passer les
                  logiciels de tri comme la lecture du recruteur.
                </p>
                <div className="relative mt-8 grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                  <div className="rounded-2xl border border-line bg-cream p-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Offre</p>
                    <div className="mt-3 flex flex-wrap gap-1.5 text-xs font-medium">
                      {["Gestion de projet", "Agile", "Budget", "Anglais courant", "Management"].map((k) => (
                        <span key={k} className="rounded-full border border-brand/20 bg-brand-soft px-2.5 py-1 text-brand-dark">{k}</span>
                      ))}
                    </div>
                  </div>
                  <div className="grid h-10 w-10 place-items-center justify-self-center rounded-full bg-ink text-white sm:rotate-0">→</div>
                  <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_16px_40px_-24px_rgba(10,77,255,0.5)]">
                    <div className="h-2.5 w-2/5 rounded-full bg-ink" />
                    <div className="mt-1.5 h-1.5 w-1/4 rounded-full bg-brand" />
                    <div className="mt-4">
                      <Lines widths={[100, 90, 96, 72]} />
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>

            <Reveal className="lg:col-span-2" delay={80}>
              <article className="relative h-full overflow-hidden rounded-[28px] bg-ink p-8 text-white sm:p-10">
                <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-violet/50 blur-3xl" />
                <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-brand/60 blur-3xl" />
                <div className="relative">
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-cyan">02 — Lettre</p>
                  <h3 className="mt-4 text-3xl font-medium">Une lettre en une minute</h3>
                  <p className="mt-3 text-white/65">Claire, personnelle, écrite à partir de ton vrai parcours et de l'offre visée.</p>
                  <div className="mt-8 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                    <Lines widths={[55, 100, 94, 98, 40]} className="bg-white/30" />
                  </div>
                </div>
              </article>
            </Reveal>

            <Reveal className="lg:col-span-3">
              <article className="card relative h-full overflow-hidden p-8 sm:p-10">
                <div className="pointer-events-none absolute -left-16 -top-20 h-64 w-64 rounded-full bg-sun/25 blur-3xl" />
                <p className="relative font-mono text-[11px] uppercase tracking-[0.16em] text-brand">03 — Suivi</p>
                <h3 className="relative mt-4 text-3xl font-medium">Toutes tes candidatures, d'un coup d'œil</h3>
                <p className="relative mt-3 text-muted">Un tableau simple pour savoir où tu en es, de la première lecture à l'offre signée.</p>
                <div className="relative mt-8 grid grid-cols-3 gap-2.5">
                  {[
                    { t: "Postulé", c: "bg-brand", n: 2 },
                    { t: "Entretien", c: "bg-sun", n: 1 },
                    { t: "Offre", c: "bg-violet", n: 1 },
                  ].map((col) => (
                    <div key={col.t} className="rounded-2xl border border-line bg-cream p-3">
                      <p className="flex items-center gap-1.5 text-xs font-medium">
                        <Diamond className={`h-1.5 w-1.5 ${col.c}`} />
                        {col.t}
                      </p>
                      <div className="mt-3 space-y-2">
                        {Array.from({ length: col.n }).map((_, i) => (
                          <div key={i} className="rounded-xl border border-line bg-white p-2.5">
                            <div className="h-1.5 w-3/4 rounded-full bg-ink/70" />
                            <div className="mt-1.5 h-1.5 w-1/2 rounded-full bg-ink/15" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </Reveal>

            <Reveal className="lg:col-span-3" delay={80}>
              <article className="card relative h-full overflow-hidden p-8 sm:p-10">
                <div className="pointer-events-none absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-cyan/25 blur-3xl" />
                <p className="relative font-mono text-[11px] uppercase tracking-[0.16em] text-brand">04 — Documents</p>
                <h3 className="relative mt-4 text-3xl font-medium">Tes documents rangés, prêts à partir</h3>
                <p className="relative mt-3 text-muted">Chaque CV et chaque lettre sont enregistrés. Modifie, copie ou exporte en PDF en un clic.</p>
                <div className="relative mt-8 space-y-2.5">
                  {["CV — Cheffe de projet · Atelier Nord", "Lettre — Cheffe de projet · Atelier Nord", "CV — Product owner · Lumen"].map((d, i) => (
                    <div key={d} className="flex items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3">
                      <Diamond className={`h-2 w-2 ${["bg-brand", "bg-violet", "bg-cyan"][i]}`} />
                      <span className="truncate text-sm font-medium">{d}</span>
                      <span className="ml-auto shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">PDF</span>
                    </div>
                  ))}
                </div>
              </article>
            </Reveal>
          </div>
        </section>

        {/* Fonctionnement */}
        <section id="fonctionnement" className="mx-auto max-w-[1320px] scroll-mt-28 px-5 pt-28 sm:px-8 sm:pt-40">
          <Reveal>
            <p className="eyebrow">Comment ça marche</p>
            <h2 className="mt-5 text-4xl font-medium leading-[1.05] sm:text-6xl">Trois étapes, pas une de plus.</h2>
          </Reveal>
          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 90}>
                <li className="card h-full list-none p-8">
                  <div className="flex items-center justify-between">
                    <span className="text-6xl font-medium tracking-[-0.06em] text-gradient">{s.n}</span>
                    <Diamond className={`h-3 w-3 ${["bg-violet", "bg-cyan", "bg-sun"][i]}`} />
                  </div>
                  <h3 className="mt-8 text-2xl font-medium">{s.title}</h3>
                  <p className="mt-3 text-muted">{s.text}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </section>

        {/* Tarifs */}
        <section id="tarifs" className="mx-auto max-w-[1320px] scroll-mt-28 px-5 pt-28 sm:px-8 sm:pt-40">
          <Reveal>
            <p className="eyebrow">Tarifs</p>
            <h2 className="mt-5 text-4xl font-medium leading-[1.05] sm:text-6xl">Simple, sans engagement.</h2>
          </Reveal>
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            <Reveal>
              <div className="card flex h-full flex-col p-8 sm:p-10">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Gratuit</p>
                <p className="mt-5 text-6xl font-medium tracking-[-0.05em]">0 €</p>
                <p className="mt-2 text-muted">Pour tester et postuler à quelques offres.</p>
                <ul className="mt-8 space-y-3 text-[15px]">
                  {["3 générations par jour", "CV et lettres de motivation", "Suivi des candidatures illimité", "Export PDF"].map((f) => (
                    <li key={f} className="flex gap-3 text-brand">
                      <Check />
                      <span className="text-ink">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/connexion?mode=inscription" className="btn-ghost mt-10 w-full py-4 text-base lg:mt-auto">
                  Commencer gratuitement
                </Link>
              </div>
            </Reveal>
            <Reveal delay={90}>
              <div className="relative flex h-full flex-col overflow-hidden rounded-[28px] bg-ink p-8 text-white sm:p-10">
                <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand/70 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-32 left-10 h-72 w-72 rounded-full bg-violet/50 blur-3xl" />
                <div className="relative flex h-full flex-col">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-cyan">Pro</p>
                    <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em]">Recherche active</span>
                  </div>
                  <p className="mt-5 text-6xl font-medium tracking-[-0.05em]">
                    9,99 € <span className="text-xl font-normal tracking-normal text-white/60">/ mois</span>
                  </p>
                  <p className="mt-2 text-white/65">Pour postuler chaque jour, à grande échelle.</p>
                  <ul className="mt-8 space-y-3 text-[15px]">
                    {["50 générations par jour", "Tout ce qui est inclus dans Gratuit", "Annulable à tout moment", "Paiement sécurisé par Stripe"].map((f) => (
                      <li key={f} className="flex gap-3 text-cyan">
                        <Check />
                        <span className="text-white">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/connexion?mode=inscription" className="btn-blue mt-10 w-full py-4 text-base lg:mt-auto">
                    Passer à Pro
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto grid max-w-[1320px] gap-10 px-5 pt-28 sm:px-8 sm:pt-40 lg:grid-cols-[1fr_1.4fr]">
          <Reveal>
            <p className="eyebrow">FAQ</p>
            <h2 className="mt-5 text-4xl font-medium leading-[1.05] sm:text-6xl">Questions fréquentes</h2>
          </Reveal>
          <Reveal>
            <div className="divide-y divide-ink/10 border-y border-ink/10">
              {faq.map((item) => (
                <details key={item.q} className="group py-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-medium sm:text-xl [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink/15 text-xl font-normal transition duration-300 group-open:rotate-45 group-open:bg-ink group-open:text-white">+</span>
                  </summary>
                  <p className="mt-4 max-w-2xl leading-relaxed text-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </Reveal>
        </section>

        {/* Appel à l'action */}
        <section className="mx-auto max-w-[1320px] px-5 py-28 sm:px-8 sm:py-40">
          <Reveal>
            <div className="relative overflow-hidden rounded-[36px] border border-line bg-white px-7 py-16 shadow-[0_40px_100px_-50px_rgba(10,77,255,0.45)] sm:px-16 sm:py-24">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_20rem_at_0%_0%,rgba(255,77,77,0.10),transparent_70%),radial-gradient(36rem_22rem_at_55%_0%,rgba(139,69,255,0.14),transparent_70%),radial-gradient(30rem_24rem_at_100%_100%,rgba(31,176,255,0.20),transparent_70%)]" />
              <Mark className="pointer-events-none absolute -right-10 top-1/2 hidden h-[130%] w-auto -translate-y-1/2 md:block" />
              <div className="relative max-w-xl">
                <h2 className="text-4xl font-medium leading-[1.02] sm:text-6xl">Ta prochaine candidature commence ici.</h2>
                <p className="mt-5 text-lg text-muted">Crée ton compte, décris ton parcours et génère ton premier document.</p>
                <Link href="/connexion?mode=inscription" className="btn mt-9 px-7 py-4 text-base">
                  Commencer gratuitement
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="bg-ink text-white">
        <div className="mx-auto grid max-w-[1320px] gap-12 px-5 py-20 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-6 max-w-xs text-3xl font-medium leading-[1.05] tracking-[-0.04em]">Une candidature sur mesure, pour chaque offre.</p>
          </div>
          <nav className="space-y-3 text-white/70">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/40">Produit</p>
            <a href="#fonctionnalites" className="block transition hover:text-white">Fonctionnalités</a>
            <a href="#fonctionnement" className="block transition hover:text-white">Comment ça marche</a>
            <a href="#tarifs" className="block transition hover:text-white">Tarifs</a>
          </nav>
          <nav className="space-y-3 text-white/70">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/40">Compte</p>
            <Link href="/connexion" className="block transition hover:text-white">Se connecter</Link>
            <Link href="/connexion?mode=inscription" className="block transition hover:text-white">Créer un compte</Link>
          </nav>
        </div>
        <div className="border-t border-white/10">
          <p className="mx-auto max-w-[1320px] px-5 py-6 font-mono text-[11px] uppercase tracking-[0.16em] text-white/40 sm:px-8">© 2026 Postulia</p>
        </div>
      </footer>
    </div>
  );
}
