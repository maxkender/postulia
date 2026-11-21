import Link from "next/link";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

export default async function Dashboard() {
  await connection();
  const supabase = await createClient();
  const [{ data: profile }, { count: docs }, { data: apps }] = await Promise.all([
    supabase.from("profiles").select("full_name, background").maybeSingle(),
    supabase.from("documents").select("id", { count: "exact", head: true }),
    supabase.from("applications").select("status"),
  ]);
  const hasProfile = Boolean(profile?.background?.trim());
  const total = apps?.length ?? 0;
  const interviews = apps?.filter((a) => a.status === "entretien" || a.status === "offre").length ?? 0;
  const firstName = profile?.full_name?.split(" ")[0];

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-semibold">Bonjour{firstName ? ` ${firstName}` : ""} 👋</h1>

      {!hasProfile && (
        <div className="card flex flex-wrap items-center justify-between gap-4 border-sun bg-sun/15">
          <div>
            <p className="font-semibold">Commence par décrire ton parcours</p>
            <p className="text-sm text-muted">Postulia s'en sert pour rédiger tes CV et tes lettres.</p>
          </div>
          <Link href="/app/profil" className="btn">Compléter mon profil</Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Documents enregistrés", value: docs ?? 0 },
          { label: "Candidatures suivies", value: total },
          { label: "Entretiens et offres", value: interviews },
        ].map((s) => (
          <div key={s.label} className="card">
            <p className="font-display text-4xl font-semibold">{s.value}</p>
            <p className="mt-1 text-sm text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { href: "/app/cv", title: "Générer un CV", text: "Adapté à une offre précise." },
          { href: "/app/lettre", title: "Écrire une lettre", text: "Lettre de motivation sur mesure." },
          { href: "/app/candidatures", title: "Suivre mes candidatures", text: "Ajoute une offre et son statut." },
        ].map((a) => (
          <Link key={a.href} href={a.href} className="card transition hover:border-brand">
            <p className="font-display text-xl font-semibold">{a.title} →</p>
            <p className="mt-1 text-sm text-muted">{a.text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
