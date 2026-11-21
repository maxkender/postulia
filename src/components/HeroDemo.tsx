"use client";

import { useEffect, useState } from "react";

const scenarios = [
  { job: "Cheffe de projet digital", company: "Atelier Nord", name: "Camille Martin", keys: ["Agile", "Budget", "Management"], score: 92, hint: "Mettre en avant la gestion de budget" },
  { job: "Développeur front-end", company: "Lumen", name: "Hugo Lambert", keys: ["React", "TypeScript", "Accessibilité"], score: 89, hint: "Insister sur les projets React" },
  { job: "Chargée de communication", company: "Solstice", name: "Inès Moreau", keys: ["Éditorial", "Réseaux sociaux", "Événementiel"], score: 94, hint: "Rendre l'accroche plus directe" },
];

function Line({ w, delay, className = "bg-ink/10" }: { w: number; delay: number; className?: string }) {
  return <div className={`demo-line h-1.5 rounded-full ${className}`} style={{ width: `${w}%`, animationDelay: `${delay}s` }} />;
}

/** Aperçu animé du produit : l'offre est saisie, le CV se rédige, le score s'affiche. Illustration. */
export function HeroDemo() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((v) => (v + 1) % scenarios.length), 6500);
    return () => clearInterval(id);
  }, []);
  const s = scenarios[i];
  const offset = 163 - (163 * s.score) / 100;

  return (
    <div className="relative mx-auto mt-14 max-w-4xl" aria-hidden>
      {/* Pastilles flottantes */}
      <div key={`score-${i}`} className="demo-pop absolute -right-6 top-24 z-10 hidden items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-[0_20px_40px_-18px_rgba(11,11,20,0.35)] lg:flex" style={{ animationDelay: "1.5s" }}>
        <svg viewBox="0 0 60 60" className="h-14 w-14 -rotate-90">
          <circle cx="30" cy="30" r="26" fill="none" stroke="#eeecff" strokeWidth="7" />
          <circle cx="30" cy="30" r="26" fill="none" stroke="url(#ring)" strokeWidth="7" strokeLinecap="round" strokeDasharray="163" strokeDashoffset={offset} className="demo-ring" />
          <defs>
            <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#5b4dff" />
              <stop offset="1" stopColor="#ff3d77" />
            </linearGradient>
          </defs>
        </svg>
        <div className="text-left">
          <p className="text-xl font-bold leading-none">{s.score}/100</p>
          <p className="mt-1 text-xs text-muted">Score ATS</p>
        </div>
      </div>
      <div key={`ok-${i}`} className="demo-pop absolute -left-12 bottom-8 z-10 hidden items-center gap-2.5 rounded-2xl bg-white px-4 py-3 text-left shadow-[0_20px_40px_-18px_rgba(11,11,20,0.35)] lg:flex" style={{ animationDelay: "2.4s" }}>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[#22c55e] text-sm font-bold text-white">✓</span>
        <div>
          <p className="text-sm font-semibold leading-tight">Lettre prête</p>
          <p className="text-xs text-muted">{s.company}</p>
        </div>
      </div>

      <div className="rounded-[28px] border border-white bg-white/70 p-2.5 shadow-[0_40px_80px_-40px_rgba(91,77,255,0.55)] backdrop-blur">
        <div className="overflow-hidden rounded-[20px] bg-white">
          <div className="flex items-center gap-1.5 border-b border-line px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-3 hidden h-6 flex-1 items-center rounded-full bg-cream px-3 text-[11px] text-muted sm:flex">postulia · candidature express</span>
          </div>
          <div key={i} className="grid gap-5 p-5 text-left sm:grid-cols-[1fr_1.25fr] sm:p-7">
            <div className="space-y-3.5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Poste visé</p>
                <p className="mt-1.5 rounded-xl border border-line px-3 py-2 text-[13px] font-medium"><span className="demo-type inline-block">{s.job}</span></p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Entreprise</p>
                <p className="mt-1.5 rounded-xl border border-line px-3 py-2 text-[13px] font-medium"><span className="demo-type inline-block" style={{ animationDelay: "0.5s" }}>{s.company}</span></p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Mots-clés repérés dans l'offre</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {s.keys.map((k, n) => (
                    <span key={k} className="demo-pop rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-semibold text-brand-dark" style={{ animationDelay: `${1 + n * 0.15}s` }}>{k}</span>
                  ))}
                </div>
              </div>
              <div className="btn-blue w-full py-2.5 text-[13px]">Préparer ma candidature</div>
            </div>
            <div className="relative rounded-2xl bg-cream p-4 sm:p-6">
              <div className="rounded-xl bg-white p-4 shadow-[0_12px_30px_-14px_rgba(11,11,20,0.35)]">
                <p className="demo-pop text-center text-[13px] font-bold leading-tight" style={{ animationDelay: "1.3s" }}>{s.name}</p>
                <p className="demo-pop text-center text-[9px] text-muted" style={{ animationDelay: "1.4s" }}>{s.job}</p>
                <p className="mt-3 border-b border-line pb-0.5 text-[8px] font-bold uppercase tracking-wider">Expériences</p>
                <div className="mt-2 space-y-1.5">
                  {[70, 100, 92, 60, 96, 84].map((w, n) => (
                    <Line key={n} w={w} delay={1.6 + n * 0.12} className={n === 0 || n === 3 ? "bg-ink/60" : "bg-ink/10"} />
                  ))}
                </div>
                <p className="mt-3 border-b border-line pb-0.5 text-[8px] font-bold uppercase tracking-wider">Compétences</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {s.keys.map((k, n) => (
                    <span key={k} className="demo-pop rounded-full bg-brand-soft px-2 py-0.5 text-[9px] font-semibold text-brand-dark" style={{ animationDelay: `${2.4 + n * 0.12}s` }}>{k}</span>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-4 left-1/2 w-[92%] -translate-x-1/2 rounded-full p-[3px] shadow-[0_14px_30px_-12px_rgba(166,61,255,0.6)]">
                <span className="tile-alt absolute inset-0 rounded-full" />
                <span className="relative flex w-full items-center justify-between rounded-full bg-white px-4 py-2.5 text-[13px]">
                  <span className="demo-type inline-block" style={{ animationDelay: "3s" }}>{s.hint}</span>
                  <span className="text-gradient text-base">✦</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
