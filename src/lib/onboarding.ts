import type { SupabaseClient } from "@supabase/supabase-js";

export const PENDING_KEY = "postulia:onboarding";

export type Answers = {
  situation?: string;
  approche?: string;
  duree?: string;
  aCv?: string;
  nom?: string;
  parcours?: string;
  objectifs?: string[];
  ia?: string;
  poste?: string;
  contrats?: string[];
  salaire?: number | null;
  modes?: string[];
  lieux?: string[];
  lieu?: string;
};

export const OPTIONS = {
  situation: ["Je suis sans emploi", "Je suis en poste", "Je suis indépendant·e ou freelance", "Je suis étudiant·e ou je cherche mon premier emploi"],
  approche: ["Je cherche activement", "Je suis à l'écoute des opportunités", "Je me renseigne simplement"],
  duree: ["Je viens de commencer (moins d'un mois)", "1 à 3 mois", "3 à 6 mois", "Plus de 6 mois", "Je ne cherche pas activement pour l'instant"],
  aCv: ["J'ai un CV", "Je n'ai pas encore de CV"],
  objectifs: ["Un revenu rapidement", "Un premier emploi pour lancer ma carrière", "Un complément de revenu", "Un meilleur équilibre de vie", "Un poste stable dans mon domaine", "Évoluer dans ma carrière", "Changer de métier"],
  ia: ["Oui", "Pas sûr·e", "Non"],
  contrats: ["Temps plein (CDI)", "Temps partiel", "CDD ou mission", "Alternance", "Stage"],
  modes: ["Télétravail complet", "Hybride", "Sur site"],
  lieux: ["Île-de-France", "Lyon", "Marseille", "Toulouse", "Bordeaux", "Lille", "Nantes", "France entière", "Europe"],
} as const;

export function readPending(): Answers | null {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as Answers) : null;
  } catch {
    return null;
  }
}

export function writePending(answers: Answers) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(answers));
  } catch {
    // stockage indisponible (navigation privée) : on continue sans
  }
}

export function clearPending() {
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch {}
}

/** Enregistre les réponses dans le profil, sans écraser un nom ou un parcours déjà saisis. */
export async function saveOnboarding(supabase: SupabaseClient, answers: Answers) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Connexion requise." };
  const { data: existing } = await supabase.from("profiles").select("full_name, headline, background").eq("id", user.id).maybeSingle();
  const { nom, parcours, ...rest } = answers;
  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    full_name: existing?.full_name || nom?.trim() || (user.user_metadata?.full_name as string | undefined) || null,
    headline: existing?.headline || answers.poste?.trim() || null,
    background: existing?.background || parcours?.trim() || null,
    onboarding: rest,
    onboarded_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  if (!error) clearPending();
  return { error: error?.message ?? null };
}

/** Résumé de la recherche pour les consignes données à l'IA. */
export function describeSearch(o: unknown): string {
  if (!o || typeof o !== "object") return "";
  const a = o as Answers & { experience?: string; mode?: string };
  const places = [...(a.lieux ?? []), a.lieu].filter(Boolean).join(", ");
  const modes = a.modes?.length ? a.modes.join(", ") : a.mode;
  const lines = [
    a.situation && `Situation : ${a.situation}`,
    a.poste && `Poste recherché : ${a.poste}`,
    a.experience && `Expérience : ${a.experience}`,
    a.objectifs?.length && `Objectifs : ${a.objectifs.join(", ")}`,
    a.contrats?.length && `Contrats visés : ${a.contrats.join(", ")}`,
    typeof a.salaire === "number" && a.salaire > 0 && `Salaire minimum souhaité : ${a.salaire} € brut par an`,
    (places || modes) && `Lieu : ${[places, modes].filter(Boolean).join(" · ")}`,
  ].filter(Boolean);
  return lines.length ? `Recherche d'emploi :\n${lines.join("\n")}`.slice(0, 1500) : "";
}
