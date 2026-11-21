import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { AppNav } from "@/components/AppNav";
import { createClient } from "@/lib/supabase/server";

async function Shell({ children }: { children: React.ReactNode }) {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/connexion");

  return (
    <>
      <AppNav email={user.email ?? ""} />
      <main className="relative mx-auto max-w-[1200px] px-4 py-10 sm:px-6 sm:py-14">{children}</main>
    </>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <div className="aurora no-print opacity-70" />
      <div className="rainbow no-print fixed inset-x-0 top-0 z-50 h-[3px]" />
      <Suspense fallback={<p className="relative p-10 text-center font-mono text-xs uppercase tracking-[0.16em] text-muted">Chargement…</p>}>
        <Shell>{children}</Shell>
      </Suspense>
    </div>
  );
}
