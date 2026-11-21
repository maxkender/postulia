import type { SupabaseClient } from "@supabase/supabase-js";

export const PENDING_KEY = "postulia:onboarding";

export type Answers = {
  situation?: string;
  approche?: string;
  poste?: string;
  experience?: string;
  contrats?: string[];
  lieu?: string;
  mode?: string;
  freins?: string[];
  nom?: string;
  parcours?: string;
};

export const OPTIONS = {
  situation: ["Je suis sans emploi", "Je suis en poste", "Je suis indépendant·e", "Je suis étudiant·e ou je cherche mon premier emploi", "Je suis en reconversion"],
  approche: ["Je cherche activement", "Je suis à l'écoute du marché", "Je me renseigne simplement"],
  experience: ["Moins d'un an", "1 à 3 ans", "3 à 7 ans", "Plus de 7 ans"],
  contrats: ["CDI", "CDD", "Alternance", "Stage", "Freelance"],
  mode: ["Sur site", "Hybride", "Télétravail"],
  freins: ["Je n'ai pas de réponses à mes candidatures", "Mon CV est à refaire", "Écrire les lettres me prend trop de temps", "Les entretiens me stressent", "J'ai du mal à m'organiser et à relancer"],
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
  const a = o as Answers;
  const lines = [
    a.situation && `Situation : ${a.situation}`,
    a.poste && `Poste recherché : ${a.poste}`,
    a.experience && `Expérience : ${a.experience}`,
    a.contrats?.length && `Contrats visés : ${a.contrats.join(", ")}`,
    (a.lieu || a.mode) && `Lieu : ${[a.lieu, a.mode].filter(Boolean).join(" · ")}`,
  ].filter(Boolean);
  return lines.length ? `Recherche d'emploi :\n${lines.join("\n")}`.slice(0, 1500) : "";
}
