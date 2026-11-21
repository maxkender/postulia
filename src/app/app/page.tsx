import Link from "next/link";
import { connection } from "next/server";
import { PLANS, isActive } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export default async function Dashboard() {
  await connection();
  const supabase = await createClient();
  // eslint-disable-next-line react-hooks/purity -- rendu à la requête (connection() ci-dessus)
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const day = new Date().toISOString().slice(0, 10);
  const [{ data: profile }, { count: docs }, { data: apps }, { data: sub }, { count: used }, { data: dueApps }, { data: dueContacts }] = await Promise.all([
    supabase.from("profiles").select("full_name, background").maybeSingle(),
    supabase.from("documents").select("id", { count: "exact", head: true }),
    supabase.from("applications").select("status"),
    supabase.from("subscriptions").select("status").maybeSingle(),
    supabase.from("generations").select("id", { count: "exact", head: true }).gte("created_at", since).neq("kind", "import"),
    supabase.from("applications").select("id, job_title, company").lte("follow_up_at", day).limit(5),
    supabase.from("contacts").select("id, name, company").lte("follow_up_at", day).limit(5),
  ]);
  const hasProfile = Boolean(profile?.background?.trim());
  const total = apps?.length ?? 0;
  const interviews = apps?.filter((a) => a.status === "entretien" || a.status === "offre").length ?? 0;
  const firstName = profile?.full_name?.split(" ")[0];
  const pro = isActive(sub?.status);
  const limit = pro ? PLANS.pro.dailyGenerations : PLANS.free.dailyGenerations;
  const left = Math.max(0, limit - (used ?? 0));

  const stats = [
    { label: "Documents enregistrés", value: docs ?? 0 },
    { label: "Candidatures suivies", value: total },
    { label: "Entretiens et offres", value: interviews },
    { label: `Générations restantes · ${pro ? "Pro" : "Gratuit"}`, value: `${left}/${limit}` },
  ];
  const actions = [
    { href: "/app/postuler", n: "01", title: "Candidature express", text: "CV + lettre + suivi en un clic.", dot: "bg-brand" },
    { href: "/app/entretien", n: "02", title: "Simuler un entretien", text: "Questions du poste et retours.", dot: "bg-violet" },
    { href: "/app/outils", n: "03", title: "Boîte à outils", text: "Score ATS, relance, salaire…", dot: "bg-coral" },
  ];

  return (
    <div className="space-y-10">
      <div>
        <p className="eyebrow">Tableau de bord</p>
        <h1 className="mt-4 text-4xl font-medium sm:text-6xl">
          Bonjour{firstName ? <span className="text-gradient"> {firstName}</span> : ""}.
        </h1>
      </div>

      {!hasProfile && (
        <div className="relative flex flex-wrap items-center justify-between gap-5 overflow-hidden rounded-[28px] bg-ink p-7 text-white sm:p-9">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-brand/70 blur-3xl" />
          <div className="relative">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-cyan">Première étape</p>
            <p className="mt-2 text-2xl font-medium tracking-[-0.03em]">Décris ton parcours</p>
            <p className="mt-1 text-white/65">Postulia s'en sert pour rédiger tes CV et tes lettres.</p>
          </div>
          <Link href="/app/profil" className="btn-blue relative">Compléter mon profil</Link>
        </div>
      )}

      {Boolean(dueApps?.length || dueContacts?.length) && (
        <div className="card ring-2 ring-coral/40">
          <p className="eyebrow !text-[#c2185b]">À relancer aujourd'hui</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {dueApps?.map((a) => (
              <li key={a.id}><Link href="/app/candidatures" className="flex items-center justify-between gap-3 rounded-2xl bg-cream px-4 py-3 text-sm"><span><b>{a.job_title}</b> · {a.company}</span><span className="font-semibold text-brand">Suivi →</span></Link></li>
            ))}
            {dueContacts?.map((c) => (
              <li key={c.id}><Link href="/app/contacts" className="flex items-center justify-between gap-3 rounded-2xl bg-cream px-4 py-3 text-sm"><span><b>{c.name}</b>{c.company ? ` · ${c.company}` : ""}</span><span className="font-semibold text-brand">Réseau →</span></Link></li>
            ))}
          </ul>
        </div>
      )}

      <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <dd className="text-5xl font-medium tracking-[-0.05em]">{s.value}</dd>
            <dt className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{s.label}</dt>
          </div>
        ))}
      </dl>

      <div className="grid gap-4 md:grid-cols-3">
        {actions.map((a) => (
          <Link key={a.href} href={a.href} className="card group transition duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_30px_60px_-30px_rgba(10,77,255,0.45)]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{a.n}</span>
              <span className={`h-2.5 w-2.5 rotate-45 rounded-[2px] ${a.dot}`} />
            </div>
            <p className="mt-10 text-2xl font-medium tracking-[-0.03em]">{a.title}</p>
            <p className="mt-1 text-muted">{a.text}</p>
            <span className="mt-6 grid h-10 w-10 place-items-center rounded-full bg-ink text-white transition group-hover:bg-brand">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
