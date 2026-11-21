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
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<p className="p-8 text-center text-muted">Chargement…</p>}>
        <Shell>{children}</Shell>
      </Suspense>
    </div>
  );
}
