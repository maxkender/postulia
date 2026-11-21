import { Generator } from "@/components/Generator";

export default function Page() {
  return (
    <div>
      <h1 className="no-print page-title">Générateur de CV</h1>
      <p className="no-print mb-6 mt-2 text-muted">Un CV réorganisé pour l'offre que tu vises, à partir de ton profil.</p>
      <Generator kind="cv" />
    </div>
  );
}
