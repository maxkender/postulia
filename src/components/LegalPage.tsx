import Link from "next/link";
import { LEGAL, isTodo } from "@/lib/legal";
import { Logo } from "./Logo";

/** Affiche une information de l'éditeur, surlignée tant qu'elle n'est pas renseignée. */
export function Info({ k }: { k: keyof typeof LEGAL }) {
  const value = LEGAL[k];
  if (!isTodo(value)) return <>{value}</>;
  return <mark className="rounded bg-[#fff1c2] px-1.5 py-0.5 text-[#7a5200]">[à compléter : {value.slice(5)}]</mark>;
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="mt-3 space-y-3 leading-relaxed text-ink/85 [&_a]:font-semibold [&_a]:text-brand [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1.5">{children}</div>
    </section>
  );
}

const PAGES = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/cgv", label: "Conditions générales" },
  { href: "/confidentialite", label: "Confidentialité" },
];

export function LegalPage({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <div className="aurora" />
      <header className="relative mx-auto flex max-w-3xl items-center justify-between px-5 py-6">
        <Logo />
        <Link href="/" className="text-sm font-semibold text-muted transition hover:text-ink">← Retour au site</Link>
      </header>
      <main className="relative mx-auto max-w-3xl px-5 pb-24 pt-8">
        <p className="eyebrow">Informations légales</p>
        <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">{title}</h1>
        <p className="mt-4 text-lg text-muted">{intro}</p>
        <p className="mt-2 text-sm text-muted">Dernière mise à jour : {LEGAL.updated}</p>
        <article className="card mt-8 sm:p-10">{children}</article>
        <nav className="mt-8 flex flex-wrap gap-2" aria-label="Autres pages légales">
          {PAGES.map((p) => (
            <Link key={p.href} href={p.href} className="btn-ghost px-4 py-2">{p.label}</Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
