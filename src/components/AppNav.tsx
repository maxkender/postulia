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
  { href: "/app/profil", label: "Profil" },
  { href: "/app/abonnement", label: "Abonnement" },
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
    <header className="no-print sticky top-0 z-30 px-4 pt-4 sm:px-6">
      <div className="glass mx-auto flex max-w-[1200px] items-center gap-3 rounded-full py-2 pl-5 pr-2">
        <Logo href="/app" />
        <nav className="mx-auto hidden items-center gap-0.5 lg:flex">
          {links.map((l) => (
            <NavLink key={l.href} {...l} pathname={pathname} />
          ))}
        </nav>
        <span className="ml-auto hidden max-w-[14rem] truncate font-mono text-[11px] text-muted xl:block lg:ml-0">{email}</span>
        <button onClick={signOut} className="btn ml-auto px-5 py-2.5 lg:ml-0">Déconnexion</button>
      </div>
      <nav className="glass mx-auto mt-2 flex max-w-[1200px] gap-0.5 overflow-x-auto rounded-full p-1.5 lg:hidden">
        {links.map((l) => (
          <NavLink key={l.href} {...l} pathname={pathname} />
        ))}
      </nav>
    </header>
  );
}

function NavLink({ href, label, pathname }: { href: string; label: string; pathname: string }) {
  const active = href === "/app" ? pathname === "/app" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition ${
        active ? "bg-ink font-medium text-white" : "text-ink/70 hover:bg-ink/5 hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
}
