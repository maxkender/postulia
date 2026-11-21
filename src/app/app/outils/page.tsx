import Link from "next/link";
import { ToolIcon } from "@/components/ToolIcon";
import { TOOLS } from "@/lib/tools";

export default function Outils() {
  return (
    <div>
      <p className="eyebrow">Boîte à outils</p>
      <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">Tous les outils pour ta recherche</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">Vérifie ton CV, prépare ton entretien, rédige une relance. Chaque utilisation compte pour une génération.</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {[
          { href: "/app/cv", title: "CV rapide", text: "Un CV pour une offre, sans passer par le parcours complet." },
          { href: "/app/lettre", title: "Lettre rapide", text: "Une lettre de motivation seule, à partir d'une annonce." },
        ].map((t) => (
          <Link key={t.href} href={t.href} className="card group flex items-center gap-4 transition duration-300 hover:-translate-y-1">
            <span className="tile grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-white"><ToolIcon name="doc" /></span>
            <span>
              <span className="block text-lg font-semibold">{t.title}</span>
              <span className="block text-sm text-muted">{t.text}</span>
            </span>
          </Link>
        ))}
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {TOOLS.map((t) => (
          <Link key={t.id} href={`/app/outils/${t.id}`} className="card group flex flex-col transition duration-300 hover:-translate-y-1">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-soft text-brand transition group-hover:bg-brand group-hover:text-white">
              <ToolIcon name={t.icon} />
            </span>
            <h2 className="mt-5 text-lg font-semibold">{t.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{t.short}</p>
            <span className="mt-5 inline-flex w-max items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1.5 text-[13px] font-semibold text-brand-dark md:mt-auto">Ouvrir →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
