import Link from "next/link";

export function ErrorNote({ error, upgrade }: { error: string; upgrade?: boolean }) {
  if (!error) return null;
  return (
    <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
      {error}{" "}
      {upgrade && (
        <Link href="/app/abonnement" className="font-semibold underline underline-offset-4">
          Voir l'offre Pro
        </Link>
      )}
    </p>
  );
}
