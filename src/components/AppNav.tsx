"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "./Logo";

const links = [
  { href: "/app", label: "Accueil" },
  { href: "/app/cv", label: "CV" },
  { href: "/app/lettre", label: "Lettre" },
  { href: "/app/candidatures", label: "Candidatures" },
  { href: "/app/documents", label: "Documents" },
  { href: "/app/profil", label: "Mon profil" },
];

export function AppNav({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="no-print border-b border-line bg-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Logo href="/app" />
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-muted md:block">{email}</span>
          <button onClick={signOut} className="btn-ghost px-4 py-2">Déconnexion</button>
        </div>
      </div>
      <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6">
        {links.map((l) => {
          const active = l.href === "/app" ? pathname === "/app" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium ${
                active ? "border-brand text-brand-dark" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
