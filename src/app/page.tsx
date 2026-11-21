import Link from "next/link";
import { Logo } from "@/components/Logo";

const features = [
  {
    title: "CV adapté à chaque offre",
    text: "Colle l'annonce : Postulia réorganise ton parcours et reprend les mots-clés du poste, sans rien inventer.",
  },
  {
    title: "Lettre de motivation en une minute",
    text: "Une lettre claire et personnelle, écrite à partir de ton vrai parcours et de l'offre visée.",
  },
  {
    title: "Suivi des candidatures",
    text: "Un tableau simple pour savoir où tu en es : à postuler, postulé, entretien, offre, refus.",
  },
  {
    title: "Tes documents au même endroit",
    text: "Chaque CV et chaque lettre sont enregistrés, prêts à être copiés ou exportés en PDF.",
  },
];

const steps = [
  { n: "1", title: "Décris ton parcours", text: "Une seule fois : expériences, formation, compétences. Tu peux coller ton CV actuel." },
  { n: "2", title: "Colle une offre", text: "Le poste, l'entreprise et le texte de l'annonce suffisent." },
  { n: "3", title: "Relis et envoie", text: "Tu obtiens un CV et une lettre sur mesure, à ajuster puis exporter." },
];

const faq = [
  {
    q: "Est-ce que l'IA invente des expériences ?",
    a: "Non. Postulia travaille uniquement à partir du parcours que tu fournis. S'il manque une information, il laisse un repère entre crochets pour que tu la complètes.",
  },
  {
    q: "Combien ça coûte ?",
    a: "Postulia est gratuit pendant la bêta, dans la limite de 20 générations par jour.",
  },
  {
    q: "Mes données sont-elles privées ?",
    a: "Ton profil, tes documents et tes candidatures ne sont visibles que par toi, depuis ton compte.",
  },
];

export default function Home() {
  return (
    <div>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link href="/connexion" className="hidden px-3 py-2 text-sm font-medium sm:block">
            Se connecter
          </Link>
          <Link href="/connexion?mode=inscription" className="btn">
            Commencer
          </Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-2 lg:pt-20">
          <div>
            <p className="mb-5 inline-block rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-dark">
              Gratuit pendant la bêta
            </p>
            <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
              Une candidature sur mesure pour <em className="text-brand">chaque</em> offre.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted">
              Postulia rédige ton CV et ta lettre de motivation à partir de ton parcours et de l'annonce, puis t'aide
              à suivre toutes tes candidatures.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/connexion?mode=inscription" className="btn px-6 py-3 text-base">
                Créer mon compte
              </Link>
              <a href="#fonctionnement" className="btn-ghost px-6 py-3 text-base">
                Voir comment ça marche
              </a>
            </div>
          </div>

          <div className="relative" aria-hidden>
            <div className="absolute -right-3 -top-3 h-full w-full rounded-3xl bg-sun/40" />
            <div className="relative rounded-3xl border border-line bg-paper p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-dark">
                  Lettre de motivation
                </span>
                <span className="text-xs text-muted">Cheffe de projet · Atelier Nord</span>
              </div>
              <p className="font-display text-lg font-semibold">Objet : candidature au poste de cheffe de projet</p>
              <div className="mt-4 space-y-2.5">
                {[100, 94, 88, 97, 60].map((w, i) => (
                  <div key={i} className="h-2.5 rounded-full bg-line" style={{ width: `${w}%` }} />
                ))}
              </div>
              <div className="mt-5 space-y-2.5">
                {[96, 100, 82, 45].map((w, i) => (
                  <div key={i} className="h-2.5 rounded-full bg-line" style={{ width: `${w}%` }} />
                ))}
              </div>
              <div className="mt-6 flex gap-2">
                <span className="rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white">Copier</span>
                <span className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold">Exporter en PDF</span>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-line bg-paper">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <h2 className="max-w-xl font-display text-3xl font-semibold sm:text-4xl">
              Moins de temps à rédiger, plus de temps à préparer tes entretiens.
            </h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {features.map((f) => (
                <div key={f.title} className="rounded-2xl border border-line bg-cream p-6">
                  <h3 className="font-display text-xl font-semibold">{f.title}</h3>
                  <p className="mt-2 text-muted">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="fonctionnement" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Comment ça marche</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <li key={s.n}>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand font-display text-lg font-semibold text-white">
                  {s.n}
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-t border-line bg-paper">
          <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">Questions fréquentes</h2>
            <div className="mt-8 divide-y divide-line border-y border-line">
              {faq.map((item) => (
                <details key={item.q} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                    {item.q}
                    <span className="text-xl text-brand transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="rounded-3xl bg-brand px-6 py-14 text-center text-white sm:px-12">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">Prêt·e pour ta prochaine candidature ?</h2>
            <p className="mx-auto mt-3 max-w-md text-white/80">Crée ton compte, décris ton parcours et génère ton premier document.</p>
            <Link
              href="/connexion?mode=inscription"
              className="mt-7 inline-flex rounded-full bg-white px-6 py-3 font-semibold text-brand-dark transition hover:bg-cream"
            >
              Commencer gratuitement
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-sm text-muted sm:px-6">
          <Logo />
          <p>© 2026 Postulia</p>
        </div>
      </footer>
    </div>
  );
}
