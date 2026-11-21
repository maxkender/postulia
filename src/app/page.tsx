import Link from "next/link";
import { HeroDemo } from "@/components/HeroDemo";
import { Logo } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";
import { ToolIcon } from "@/components/ToolIcon";
import { TOOLS } from "@/lib/tools";

const jobs = [
  "Cheffe de projet",
  "Développeur front-end",
  "Chargée de communication",
  "Comptable",
  "Product owner",
  "Infirmier coordinateur",
  "Commercial B2B",
  "Data analyst",
  "Assistante RH",
  "Responsable logistique",
];

const examples = [
  { job: "Développeuse web", text: "Projets, technos et résultats mis en avant.", tint: "from-[#e9e6ff] to-[#f6f4ff]", chip: "bg-brand-soft text-brand-dark" },
  { job: "Responsable marketing", text: "Campagnes, budgets et chiffres clés en tête.", tint: "from-[#ffe4ee] to-[#fff4f8]", chip: "bg-[#ffe1ea] text-[#c2185b]" },
  { job: "Analyste financier", text: "Rigueur, outils et périmètres bien lisibles.", tint: "from-[#dff1ff] to-[#f3faff]", chip: "bg-[#dcefff] text-[#0b63b6]" },
  { job: "Chargé des ressources humaines", text: "Recrutement, paie et dialogue social.", tint: "from-[#ffeeda] to-[#fff8ef]", chip: "bg-[#ffe9cc] text-[#a85b00]" },
  { job: "Cadre commercial", text: "Portefeuille, objectifs et taux d'atteinte.", tint: "from-[#e3f7ea] to-[#f4fcf7]", chip: "bg-[#d9f3e2] text-[#157a43]" },
  { job: "Cheffe de produit", text: "Vision, priorisation et impact mesuré.", tint: "from-[#f1e3ff] to-[#faf4ff]", chip: "bg-[#eedcff] text-[#7a1fd1]" },
];

const faq = [
  {
    q: "Qu'est-ce que Postulia et comment ça marche ?",
    a: "Tu décris ton parcours une seule fois. Ensuite, pour chaque offre, tu colles l'annonce : Postulia rédige un CV et une lettre de motivation adaptés, les range dans tes documents et ajoute l'offre à ton suivi.",
  },
  {
    q: "Est-ce que l'IA invente des expériences ?",
    a: "Non. Postulia travaille uniquement à partir du parcours que tu fournis. S'il manque une information, il laisse un repère entre crochets pour que tu la complètes. Relis toujours tes documents avant de les envoyer.",
  },
  {
    q: "Mon CV passera-t-il les logiciels de tri (ATS) ?",
    a: "Les CV sont rédigés dans une structure simple que ces logiciels lisent bien, avec le vocabulaire de l'offre. Le vérificateur ATS te donne en plus un score et la liste des mots-clés manquants avant d'envoyer.",
  },
  {
    q: "Postulia envoie-t-il les candidatures à ma place ?",
    a: "Non. Postulia prépare le dossier complet en un clic, mais c'est toi qui l'envoies. Tu gardes la main sur ce qui part à ton nom, et tu évites les candidatures en masse que les recruteurs repèrent.",
  },
  {
    q: "Comment fonctionne la simulation d'entretien ?",
    a: "Un recruteur IA te pose les questions probables pour le poste, une par une. Après chaque réponse, il te dit ce qui est bien et ce qui manque. À la fin, tu reçois un bilan noté avec des conseils.",
  },
  {
    q: "Qu'est-ce qu'une génération ?",
    a: "Chaque document rédigé ou chaque analyse compte pour une génération : un CV, une lettre, un score ATS, un e-mail de relance. Une candidature express en utilise deux. Une simulation d'entretien complète n'en utilise qu'une.",
  },
  {
    q: "Quelle différence entre Gratuit et Pro ?",
    a: "L'offre gratuite donne 3 générations par jour, avec tous les outils, le suivi des candidatures et l'export PDF. Pro monte à 50 générations par jour, pour postuler à grande échelle.",
  },
  {
    q: "Puis-je annuler mon abonnement ?",
    a: "Oui, à tout moment depuis ton espace, en un clic. Tu gardes l'accès Pro jusqu'à la fin de la période payée.",
  },
  {
    q: "Mes données sont-elles privées ?",
    a: "Ton profil, tes documents et tes candidatures ne sont visibles que par toi, depuis ton compte. Le paiement est géré par Stripe : Postulia ne voit jamais ta carte.",
  },
];

const steps = [
  { n: "1", title: "Décris ton parcours", text: "Une seule fois. Colle ton CV actuel ou le texte de ton profil LinkedIn." },
  { n: "2", title: "Colle une offre", text: "Poste, entreprise et texte de l'annonce : Postulia repère ce que le recruteur attend." },
  { n: "3", title: "Récupère ton dossier", text: "CV et lettre sur mesure, rangés et suivis. Tu relis, tu exportes en PDF, tu postules." },
];

const versus = [
  { before: "Réécrire son CV à la main pour chaque annonce", after: "Un CV adapté en quelques minutes" },
  { before: "Une lettre recopiée d'une candidature à l'autre", after: "Une lettre écrite pour l'offre, à partir de ton parcours" },
  { before: "Aucune idée de ce que voit le logiciel de tri", after: "Un score ATS et les mots-clés manquants" },
  { before: "Un tableur oublié au bout de dix candidatures", after: "Un suivi rempli automatiquement" },
  { before: "Découvrir les questions le jour de l'entretien", after: "Une simulation avec retours avant le vrai rendez-vous" },
];

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
      <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 16 16" className="mt-1 h-4 w-4 shrink-0" aria-hidden>
      <path d="M3 8.5l3.2 3.2L13 4.8" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Lines({ widths, className = "bg-ink/10" }: { widths: number[]; className?: string }) {
  return (
    <div className="space-y-1.5">
      {widths.map((w, i) => (
        <div key={i} className={`h-1.5 rounded-full ${className}`} style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

function SmallCta({ children = "Commencer maintenant" }: { children?: React.ReactNode }) {
  return (
    <Link href="/connexion?mode=inscription" className="btn-ghost px-4 py-2 text-[13px]">
      {children} <Arrow />
    </Link>
  );
}

/** Mini CV dessiné en CSS, réutilisé dans plusieurs sections. */
function MiniCv({ name, role, chip = "bg-brand-soft text-brand-dark", className = "" }: { name: string; role: string; chip?: string; className?: string }) {
  return (
    <div className={`rounded-xl bg-white p-4 shadow-[0_12px_30px_-14px_rgba(11,11,20,0.35)] ${className}`}>
      <p className="text-center text-[13px] font-bold leading-tight">{name}</p>
      <p className="text-center text-[9px] text-muted">{role}</p>
      <p className="mt-3 border-b border-line pb-0.5 text-[8px] font-bold uppercase tracking-wider">Expériences</p>
      <div className="mt-2">
        <Lines widths={[70, 100, 92]} />
      </div>
      <div className="mt-2.5">
        <Lines widths={[60, 96, 84]} />
      </div>
      <p className="mt-3 border-b border-line pb-0.5 text-[8px] font-bold uppercase tracking-wider">Compétences</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {[26, 34, 22, 30].map((w, i) => (
          <span key={i} className={`h-3 rounded-full ${chip}`} style={{ width: w }} />
        ))}
      </div>
    </div>
  );
}

function Ticker() {
  const items = [...jobs, ...jobs];
  return (
    <div className="relative mt-16 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]" aria-hidden>
      <div className="flex w-max animate-marquee gap-3 pr-3">
        {items.map((j, i) => (
          <span key={i} className="flex items-center gap-2.5 whitespace-nowrap rounded-full bg-white px-4 py-2 text-[13px] shadow-[0_1px_2px_rgba(11,11,20,0.05)]">
            <span className={`h-5 w-5 rounded-md ${["bg-brand-soft", "bg-[#ffe1ea]", "bg-[#dcefff]", "bg-[#ffe9cc]", "bg-[#d9f3e2]"][i % 5]}`} />
            <span className="font-semibold">{j}</span>
            <span className="text-muted">CV + lettre</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Tuile illustrée : fond dégradé vif + élément d'interface blanc. */
function Tile({ children, alt = false }: { children: React.ReactNode; alt?: boolean }) {
  return (
    <div className={`${alt ? "tile-alt" : "tile"} relative mt-5 grid h-52 place-items-center overflow-hidden rounded-3xl p-6`} aria-hidden>
      <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/25 blur-2xl" />
      {children}
    </div>
  );
}

function DarkPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-flex rounded-full p-[2px] shadow-[0_10px_24px_-10px_rgba(11,11,20,0.7)]">
      <span className="tile-alt absolute inset-0 rounded-full" />
      <span className="relative rounded-full bg-ink px-4 py-2 text-[12px] font-semibold text-white">{children}</span>
    </span>
  );
}

const tools = [
  {
    title: "CV sur mesure",
    text: "Un CV réorganisé pour chaque annonce : les expériences qui comptent passent en premier.",
    visual: (
      <div className="relative w-44">
        <div className="rounded-2xl bg-white/85 p-4 backdrop-blur">
          <div className="h-2 w-1/2 rounded-full bg-ink/70" />
          <div className="mt-3">
            <Lines widths={[100, 90, 96, 70]} className="bg-ink/15" />
          </div>
        </div>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <DarkPill>✦ Réécrire la section</DarkPill>
        </div>
      </div>
    ),
  },
  {
    title: "Lettre de motivation IA",
    text: "Une lettre personnelle en quelques secondes, écrite à partir de ton vrai parcours et de l'offre.",
    visual: (
      <div className="relative w-48">
        <div className="mx-auto mb-2 flex w-max gap-1 rounded-full bg-white/90 p-1 text-[10px] font-semibold">
          <span className="rounded-full bg-ink px-2.5 py-1 text-white">Formel</span>
          <span className="px-2 py-1 text-muted">Direct</span>
          <span className="px-2 py-1 text-muted">Concis</span>
        </div>
        <div className="rounded-2xl bg-white/85 p-4 backdrop-blur">
          <Lines widths={[45, 100, 94, 98, 60]} className="bg-ink/15" />
        </div>
      </div>
    ),
  },
  {
    title: "Mots-clés de l'offre",
    text: "Postulia reprend le vocabulaire de l'annonce pour passer les logiciels de tri des recruteurs.",
    visual: (
      <div className="flex w-52 flex-wrap justify-center gap-1.5 text-[11px] font-semibold">
        {["Gestion de projet", "Agile", "Budget", "Anglais", "Management", "Reporting"].map((k, i) => (
          <span key={k} className={`rounded-full px-3 py-1.5 ${i % 3 === 0 ? "bg-ink text-white" : "bg-white/90 text-ink"}`}>{k}</span>
        ))}
      </div>
    ),
  },
  {
    title: "Suivi des candidatures",
    text: "Un tableau clair pour savoir où tu en es : à postuler, postulé, entretien, offre, refus.",
    visual: (
      <div className="w-52 space-y-2">
        {[
          { t: "Atelier Nord", s: "Entretien", c: "bg-[#ffe9cc] text-[#a85b00]" },
          { t: "Lumen", s: "Postulé", c: "bg-brand-soft text-brand-dark" },
          { t: "Solstice", s: "Offre", c: "bg-[#d9f3e2] text-[#157a43]" },
        ].map((r) => (
          <div key={r.t} className="flex items-center justify-between rounded-xl bg-white/90 px-3 py-2 text-[11px] font-semibold">
            {r.t}
            <span className={`rounded-full px-2 py-0.5 text-[10px] ${r.c}`}>{r.s}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "Export PDF",
    text: "Chaque document se télécharge en PDF propre, prêt à joindre à ta candidature.",
    visual: (
      <div className="relative w-40">
        <div className="rounded-2xl bg-white/85 p-4 backdrop-blur">
          <Lines widths={[60, 100, 92, 96, 80, 50]} className="bg-ink/15" />
        </div>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <DarkPill>↓ Télécharger en PDF</DarkPill>
        </div>
      </div>
    ),
  },
  {
    title: "Tous tes documents rangés",
    text: "Tes CV et tes lettres sont enregistrés par offre. Retrouve, modifie ou copie en un clic.",
    visual: (
      <div className="w-52 space-y-2">
        {["CV · Cheffe de projet", "Lettre · Cheffe de projet", "CV · Product owner"].map((d) => (
          <div key={d} className="flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 text-[11px] font-semibold">
            <span className="h-4 w-3 rounded-[3px] bg-brand" />
            {d}
          </div>
        ))}
      </div>
    ),
  },
];

export default function Home() {
  return (
    <div className="relative overflow-x-clip">
      <div className="aurora" />

      <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5">
        <div className="glass mx-auto flex max-w-6xl items-center justify-between rounded-full py-2 pl-5 pr-2">
          <Logo />
          <nav className="hidden items-center gap-1 text-[15px] font-medium md:flex">
            <a href="#fonctionnalites" className="rounded-full px-3.5 py-2 transition hover:bg-ink/5">Fonctionnalités</a>
            <a href="#outils" className="rounded-full px-3.5 py-2 transition hover:bg-ink/5">Outils</a>
            <a href="#tarifs" className="rounded-full px-3.5 py-2 transition hover:bg-ink/5">Tarifs</a>
            <a href="#faq" className="rounded-full px-3.5 py-2 transition hover:bg-ink/5">FAQ</a>
          </nav>
          <div className="flex items-center gap-1">
            <Link href="/connexion" className="hidden rounded-full px-4 py-2 text-[15px] font-semibold sm:block">Se connecter</Link>
            <Link href="/connexion?mode=inscription" className="btn-blue px-5 py-2.5 text-[15px]">S'inscrire</Link>
          </div>
        </div>
      </header>

      <main className="relative">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-5 pt-12 text-center sm:px-8 sm:pt-16">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-sm font-semibold shadow-[0_1px_2px_rgba(11,11,20,0.05)] backdrop-blur">
            <span className="text-gradient">✦</span> CV et lettre adaptés à chaque annonce
          </p>
          <h1 className="mx-auto mt-7 max-w-5xl text-[clamp(2.1rem,5vw,3.5rem)] leading-[1.12]">
            <span className="block text-balance font-normal">Ne réécris plus ton CV pour chaque offre.</span>
            <span className="text-gradient block text-balance font-bold">Postule avec une candidature sur mesure.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink/80">
            Postulia rédige ton CV et ta lettre de motivation à partir de ton parcours et de l'annonce, puis t'aide à
            suivre toutes tes candidatures au même endroit.
          </p>
          <Link href="/connexion?mode=inscription" className="btn-blue mt-8 px-7 py-4 text-lg">
            Commencer maintenant <Arrow />
          </Link>
          <p className="mt-4 text-sm text-muted">Sans carte bancaire · 3 générations offertes par jour</p>

          <HeroDemo />
        </section>

        <Ticker />

        {/* Bento */}
        <section id="fonctionnalites" className="mx-auto max-w-6xl scroll-mt-24 px-5 pt-24 sm:px-8 sm:pt-32">
          <Reveal>
            <h2 className="mx-auto max-w-3xl text-balance text-center text-3xl font-bold leading-[1.1] sm:text-5xl">
              Une candidature complète pour chaque offre, en quelques minutes
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            <Reveal>
              <article className="card relative h-full overflow-hidden pb-0 sm:p-8 sm:pb-0">
                <p className="eyebrow">Prépare-toi</p>
                <h3 className="mt-3 text-2xl font-semibold">Créateur de CV par IA</h3>
                <p className="mt-2 max-w-sm text-lg leading-snug text-muted">Un CV réécrit pour chaque candidature, à partir de tes compétences et de ton expérience.</p>
                <div className="mt-5">
                  <SmallCta />
                </div>
                <div className="relative mx-auto mt-8 w-64" aria-hidden>
                  <MiniCv name="Camille Martin" role="Cheffe de projet digital" className="rounded-b-none pb-10" />
                  <div className="absolute -left-10 -right-10 top-[58%] rounded-full p-[3px] shadow-[0_14px_30px_-12px_rgba(166,61,255,0.6)]">
                    <span className="tile-alt absolute inset-0 rounded-full" />
                    <span className="relative flex items-center justify-between rounded-full bg-white px-5 py-3 text-sm">
                      Rendre le texte plus concis<span className="text-gradient">✦</span>
                    </span>
                  </div>
                </div>
              </article>
            </Reveal>
            <Reveal delay={80}>
              <article className="card relative h-full overflow-hidden pb-0 sm:p-8 sm:pb-0">
                <p className="eyebrow">Postule</p>
                <h3 className="mt-3 text-2xl font-semibold">Lettre de motivation sur mesure</h3>
                <p className="mt-2 max-w-sm text-lg leading-snug text-muted">Colle l'annonce, Postulia écrit la lettre. Tu relis, tu ajustes, tu envoies.</p>
                <div className="mt-5">
                  <SmallCta />
                </div>
                <div className="relative mx-auto mt-8 w-72 rounded-t-2xl bg-white p-5 shadow-[0_12px_30px_-14px_rgba(11,11,20,0.35)]" aria-hidden>
                  <p className="text-[11px] font-bold">Objet : candidature — cheffe de projet</p>
                  <p className="mt-3 text-[10px] text-muted">Madame, Monsieur,</p>
                  <div className="mt-2">
                    <Lines widths={[100, 96, 92, 98, 70]} />
                  </div>
                  <div className="mt-3">
                    <Lines widths={[96, 100, 88, 40]} />
                  </div>
                  <span className="absolute -right-5 top-10 rounded-full bg-brand px-3 py-1.5 text-[11px] font-semibold text-white shadow-[0_10px_20px_-8px_rgba(91,77,255,0.8)]">✓ Prête à envoyer</span>
                </div>
              </article>
            </Reveal>
            <Reveal>
              <article className="relative h-full overflow-hidden rounded-[28px] bg-ink p-6 text-white sm:p-8">
                <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-brand/70 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 left-0 h-56 w-56 rounded-full bg-coral/40 blur-3xl" />
                <div className="relative">
                  <p className="eyebrow !text-white/60">Accélère</p>
                  <h3 className="mt-3 text-2xl font-semibold">Candidature express</h3>
                  <p className="mt-2 max-w-sm text-lg leading-snug text-white/70">Une annonce collée, un clic : le CV, la lettre et la ligne de suivi sont prêts.</p>
                  <ol className="mt-7 space-y-2.5" aria-hidden>
                    {["CV adapté", "Lettre de motivation", "Ajout au suivi"].map((t) => (
                      <li key={t} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-medium backdrop-blur">
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-[#22c55e] text-[11px] font-bold">✓</span>
                        {t}
                      </li>
                    ))}
                  </ol>
                </div>
              </article>
            </Reveal>
            <Reveal delay={80}>
              <article className="card relative h-full overflow-hidden sm:p-8">
                <p className="eyebrow">Entraîne-toi</p>
                <h3 className="mt-3 text-2xl font-semibold">Simulation d'entretien</h3>
                <p className="mt-2 max-w-sm text-lg leading-snug text-muted">Un recruteur IA te pose les questions du poste et commente chacune de tes réponses.</p>
                <div className="mt-7 space-y-2.5 text-sm" aria-hidden>
                  <p className="w-[88%] rounded-[20px] rounded-bl-md bg-cream px-4 py-3">Parlez-moi d'un projet où vous avez dû arbitrer entre délai et qualité.</p>
                  <p className="ml-auto w-[80%] rounded-[20px] rounded-br-md bg-brand px-4 py-3 text-white">Sur la refonte du site, j'ai proposé de livrer en deux lots…</p>
                  <p className="w-[88%] rounded-[20px] rounded-bl-md bg-brand-soft px-4 py-3 text-brand-dark"><b>Retour :</b> bon exemple, ajoute le résultat chiffré.</p>
                </div>
              </article>
            </Reveal>
            <Reveal className="md:col-span-2">
              <article className="grid overflow-hidden rounded-[28px] bg-white shadow-[0_1px_2px_rgba(11,11,20,0.04),0_20px_40px_-28px_rgba(11,11,20,0.18)] md:grid-cols-[2fr_3fr]">
                <div className="p-6 sm:p-8">
                  <p className="eyebrow">Réussis</p>
                  <h3 className="mt-3 text-2xl font-semibold">Suivi des candidatures</h3>
                  <p className="mt-2 text-lg leading-snug text-muted">Chaque offre, son statut et ses documents, dans un seul tableau.</p>
                  <div className="mt-5">
                    <SmallCta />
                  </div>
                  <p className="mt-8 text-sm leading-relaxed text-muted">
                    De « à postuler » jusqu'à « offre » : tu sais toujours qui relancer, et quel CV tu as envoyé à qui.
                  </p>
                </div>
                <div className="grid place-items-center bg-[#e9e9ee] p-6 sm:p-10" aria-hidden>
                  <div className="grid w-full max-w-md grid-cols-3 gap-2.5">
                    {[
                      { t: "Postulé", items: ["Lumen", "Orbe"] },
                      { t: "Entretien", items: ["Atelier Nord"] },
                      { t: "Offre", items: ["Solstice"] },
                    ].map((col) => (
                      <div key={col.t} className="rounded-2xl bg-white/70 p-2.5 backdrop-blur">
                        <p className="px-1 text-[11px] font-semibold">{col.t}</p>
                        <div className="mt-2 space-y-2">
                          {col.items.map((it) => (
                            <div key={it} className="rounded-xl bg-white p-2.5 shadow-sm">
                              <p className="text-[11px] font-semibold">{it}</p>
                              <div className="mt-1.5 h-1.5 w-2/3 rounded-full bg-ink/10" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            </Reveal>
          </div>
        </section>

        {/* Étapes */}
        <section className="mx-auto max-w-6xl px-5 pt-28 sm:px-8 sm:pt-40">
          <Reveal>
            <h2 className="text-center text-3xl font-bold leading-[1.1] sm:text-5xl">Trois étapes, pas une de plus</h2>
          </Reveal>
          <ol className="mt-12 grid gap-4 md:grid-cols-3">
            {steps.map((st, n) => (
              <Reveal key={st.n} delay={n * 80}>
                <li className="card h-full list-none sm:p-8">
                  <span className="tile grid h-12 w-12 place-items-center rounded-2xl text-xl font-bold text-white">{st.n}</span>
                  <h3 className="mt-6 text-2xl font-semibold">{st.title}</h3>
                  <p className="mt-2 text-lg leading-snug text-muted">{st.text}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </section>

        {/* Grille d'outils */}
        <section className="mx-auto max-w-6xl px-5 pt-28 sm:px-8 sm:pt-40">
          <Reveal>
            <h2 className="mx-auto max-w-3xl text-balance text-center text-3xl leading-[1.1] sm:text-5xl">
              Tout ce qu'il te faut pour décrocher des entretiens <span className="text-gradient font-bold">plus vite</span>
            </h2>
          </Reveal>
          <div className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((t, i) => (
              <Reveal key={t.title} delay={(i % 3) * 80}>
                <h3 className="text-xl font-semibold">{t.title}</h3>
                <p className="mt-3 min-h-[4.5rem] text-[15px] leading-relaxed text-ink/80">{t.text}</p>
                <Tile alt={i % 2 === 1}>{t.visual}</Tile>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Avant / après */}
        <section className="mx-auto max-w-5xl px-5 pt-28 sm:px-8 sm:pt-40">
          <Reveal>
            <h2 className="mx-auto max-w-3xl text-balance text-center text-3xl font-bold leading-[1.1] sm:text-5xl">Chercher un emploi, avant et après Postulia</h2>
          </Reveal>
          <Reveal>
            <div className="mt-12 overflow-hidden rounded-[28px] bg-white shadow-[0_1px_2px_rgba(11,11,20,0.04),0_20px_40px_-28px_rgba(11,11,20,0.18)]">
              <div className="grid grid-cols-2 text-sm font-semibold uppercase tracking-[0.1em]">
                <p className="px-5 py-4 text-muted sm:px-8">À la main</p>
                <p className="tile px-5 py-4 text-white sm:px-8">Avec Postulia</p>
              </div>
              {versus.map((v) => (
                <div key={v.before} className="grid grid-cols-2 border-t border-line">
                  <p className="flex gap-3 px-5 py-5 text-muted sm:px-8"><span className="text-coral">✕</span>{v.before}</p>
                  <p className="flex gap-3 bg-brand-soft/50 px-5 py-5 font-medium sm:px-8"><span className="text-[#16a34a]">✓</span>{v.after}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* Boîte à outils */}
        <section id="outils" className="mx-auto max-w-6xl scroll-mt-24 px-5 pt-28 sm:px-8 sm:pt-40">
          <Reveal>
            <p className="mx-auto w-max rounded-full bg-white px-4 py-1.5 text-sm font-semibold shadow-[0_1px_2px_rgba(11,11,20,0.05)]">
              <span className="text-brand">★</span> Inclus dans l'offre gratuite
            </p>
            <h2 className="mt-5 text-center text-3xl font-bold leading-[1.1] sm:text-5xl">Une boîte à outils pour chaque étape</h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-lg text-muted">Vérifie ton CV, rédige une relance, prépare l'entretien, négocie ton salaire.</p>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TOOLS.map((t, n) => (
              <Reveal key={t.id} delay={(n % 4) * 60}>
                <Link href="/connexion?mode=inscription" className="card group flex h-full flex-col transition duration-300 hover:-translate-y-1">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-white">
                    <ToolIcon name={t.icon} />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{t.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{t.short}</p>
                  <span className="mt-5 inline-flex w-max items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 text-[13px] font-semibold text-brand-dark">Voir l'outil <Arrow /></span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Appel à l'action intermédiaire */}
        <section className="mx-auto max-w-6xl px-5 pt-10 text-center sm:px-8">
          <svg viewBox="0 0 800 160" className="mx-auto hidden w-full max-w-3xl text-ink/15 sm:block" fill="none" aria-hidden>
            <path d="M40 0C60 90 280 70 372 160" stroke="currentColor" strokeWidth="1.5" />
            <path d="M760 0C740 90 520 70 428 160" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <Reveal>
            <h2 className="mt-8 text-3xl sm:text-5xl">On t'aide à décrocher ton prochain poste</h2>
            <Link href="/connexion?mode=inscription" className="btn-blue mt-8 px-7 py-3.5 text-base">
              Commencer maintenant
            </Link>
          </Reveal>
        </section>

        {/* Exemples de CV */}
        <section className="mx-auto max-w-6xl px-5 pt-28 sm:px-8 sm:pt-40">
          <Reveal>
            <h2 className="text-center text-3xl font-bold leading-[1.1] sm:text-5xl">Un CV pensé pour ton métier</h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-lg text-muted">Quel que soit le poste, Postulia met en avant ce que le recruteur cherche en premier.</p>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {examples.map((e, i) => (
              <Reveal key={e.job} delay={(i % 3) * 80}>
                <Link href="/connexion?mode=inscription" className="group block h-full overflow-hidden rounded-[24px] bg-white shadow-[0_1px_2px_rgba(11,11,20,0.04),0_20px_40px_-28px_rgba(11,11,20,0.18)] transition duration-300 hover:-translate-y-1">
                  <div className={`bg-gradient-to-b ${e.tint} px-10 pt-7`} aria-hidden>
                    <MiniCv name={["Emma Rodrigues", "David Wilson", "Lisa Thompson", "Nora Benali", "Hugo Lambert", "Inès Moreau"][i]} role={e.job} chip={e.chip} className="rounded-b-none transition duration-300 group-hover:-translate-y-1" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold">{e.job}</h3>
                    <p className="mt-1.5 text-muted">{e.text}</p>
                    <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                      Créer ce CV <Arrow />
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-muted">Exemples illustratifs : ton CV est toujours rédigé à partir de ton propre parcours.</p>
        </section>

        {/* Tarifs */}
        <section id="tarifs" className="mx-auto max-w-5xl scroll-mt-24 px-5 pt-28 sm:px-8 sm:pt-40">
          <Reveal>
            <p className="mx-auto w-max rounded-full bg-white px-4 py-1.5 text-sm font-semibold shadow-[0_1px_2px_rgba(11,11,20,0.05)]">
              <span className="text-brand">★</span> Sans engagement
            </p>
            <h2 className="mt-5 text-center text-3xl font-bold leading-[1.1] sm:text-5xl">Un tarif simple</h2>
            <p className="mx-auto mt-4 max-w-xl text-center text-lg text-muted">Commence gratuitement. Passe à Pro quand ta recherche s'accélère.</p>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <Reveal>
              <div className="card flex h-full flex-col sm:p-9">
                <p className="eyebrow !text-muted">Gratuit</p>
                <p className="mt-4 text-6xl font-bold tracking-[-0.03em]">0 €</p>
                <p className="mt-2 text-muted">Pour tester et postuler à quelques offres.</p>
                <ul className="mt-7 space-y-3">
                  {["3 générations par jour", "CV, lettres et candidature express", "Simulation d'entretien et 8 outils", "Suivi des candidatures et export PDF"].map((f) => (
                    <li key={f} className="flex gap-3 text-brand">
                      <Check />
                      <span className="text-ink">{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="grow" />
                <Link href="/connexion?mode=inscription" className="btn-ghost mt-9 w-full py-3.5 text-base">
                  Commencer gratuitement
                </Link>
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="tile-alt relative h-full rounded-[30px] p-[3px] shadow-[0_30px_60px_-30px_rgba(166,61,255,0.7)]">
                <div className="flex h-full flex-col rounded-[27px] bg-white p-6 sm:p-9">
                  <div className="flex items-center justify-between">
                    <p className="eyebrow">Pro</p>
                    <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-dark">Recherche active</span>
                  </div>
                  <p className="mt-4 text-6xl font-bold tracking-[-0.03em]">
                    9,99 € <span className="text-xl font-normal tracking-normal text-muted">/ mois</span>
                  </p>
                  <p className="mt-2 text-muted">Pour postuler chaque jour, à grande échelle.</p>
                  <ul className="mt-7 space-y-3">
                    {["50 générations par jour", "Tout ce qui est inclus dans Gratuit", "Annulable à tout moment", "Paiement sécurisé par Stripe"].map((f) => (
                      <li key={f} className="flex gap-3 text-brand">
                        <Check />
                        <span className="text-ink">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="grow" />
                  <Link href="/connexion?mode=inscription" className="btn-blue mt-9 w-full py-3.5 text-base">
                    Passer à Pro <Arrow />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-4xl scroll-mt-24 px-5 pt-28 sm:px-8 sm:pt-40">
          <Reveal>
            <h2 className="text-center text-3xl font-bold sm:text-5xl">Questions fréquentes</h2>
          </Reveal>
          <div className="mt-10 space-y-3">
            {faq.map((item) => (
              <details key={item.q} className="group rounded-2xl bg-white px-6 py-5 shadow-[0_1px_2px_rgba(11,11,20,0.04)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0 transition duration-300 group-open:rotate-180" aria-hidden>
                    <path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <p className="mt-3 max-w-3xl leading-relaxed text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Appel à l'action final */}
        <section className="mx-auto max-w-6xl px-5 py-28 sm:px-8 sm:py-36">
          <Reveal>
            <div className="tile relative overflow-hidden rounded-[36px] px-6 py-16 text-center text-white sm:py-24">
              <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-white/25 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-brand/60 blur-3xl" />
              <div className="relative">
                <h2 className="mx-auto max-w-3xl text-balance text-4xl font-bold leading-[1.05] sm:text-6xl">Ta prochaine candidature commence ici.</h2>
                <p className="mx-auto mt-5 max-w-md text-lg text-white/85">Crée ton compte, décris ton parcours et génère ton premier document.</p>
                <Link href="/connexion?mode=inscription" className="btn mt-9 px-7 py-4 text-lg">
                  Commencer maintenant <Arrow />
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-line bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-muted">Un CV et une lettre de motivation sur mesure pour chaque offre, et un suivi clair de tes candidatures.</p>
          </div>
          <nav className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.12em]">Produit</p>
            <a href="#fonctionnalites" className="block text-muted transition hover:text-ink">Fonctionnalités</a>
            <a href="#outils" className="block text-muted transition hover:text-ink">Outils</a>
            <a href="#tarifs" className="block text-muted transition hover:text-ink">Tarifs</a>
            <a href="#faq" className="block text-muted transition hover:text-ink">FAQ</a>
          </nav>
          <nav className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.12em]">Compte</p>
            <Link href="/connexion" className="block text-muted transition hover:text-ink">Se connecter</Link>
            <Link href="/connexion?mode=inscription" className="block text-muted transition hover:text-ink">Créer un compte</Link>
          </nav>
        </div>
        <p className="border-t border-line py-6 text-center text-sm text-muted">© 2026 Postulia</p>
      </footer>
    </div>
  );
}
