import { Generator } from "@/components/Generator";

export default function Page() {
  return (
    <div>
      <h1 className="no-print font-display text-3xl font-semibold">Lettre de motivation</h1>
      <p className="no-print mb-6 mt-2 text-muted">Une lettre écrite pour une offre précise, à partir de ton profil.</p>
      <Generator kind="letter" />
    </div>
  );
}
