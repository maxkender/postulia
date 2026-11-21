import { aiConfigured, notConfigured, quotaError, streamCompletion, type ChatMessage } from "@/lib/ai";
import { describeSearch } from "@/lib/onboarding";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 300;

const SYSTEM = `Tu fais passer un entretien d'embauche simulé, en français, pour entraîner un candidat. Tu joues le recruteur : professionnel, bienveillant, exigeant.

Déroulé :
- Au premier message, présente-toi en une phrase et pose la première question.
- Ensuite, à chaque réponse du candidat : donne d'abord un retour bref sous le titre « **Retour** » (ce qui est bien, ce qui manque, une piste concrète en 2 ou 3 phrases), puis pose la question suivante sous « **Question suivante** ».
- Une seule question à la fois. Varie : motivation, expérience, mise en situation, question difficile. Appuie-toi sur l'offre et sur le parcours du candidat.
- Si le candidat écrit « BILAN », arrête les questions et donne un bilan structuré : « ## Points forts », « ## Axes de progrès », « ## Trois conseils pour le vrai entretien », puis une note sur 10.
Reste concis.`;

type Body = { jobTitle?: string; company?: string; jobDescription?: string; messages?: { role?: string; content?: string }[] };

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Connexion requise." }, { status: 401 });
  if (!aiConfigured()) return notConfigured();

  const body = (await request.json().catch(() => ({}))) as Body;
  const jobTitle = (body.jobTitle ?? "").trim().slice(0, 200);
  if (!jobTitle) return Response.json({ error: "Indique le poste visé." }, { status: 400 });
  const history: ChatMessage[] = (body.messages ?? [])
    .slice(-40)
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content!.slice(0, 6000) }));
  if (history.length > 40) return Response.json({ error: "Entretien trop long : demande le bilan." }, { status: 400 });

  const { data: profile } = await supabase.from("profiles").select("full_name, headline, background, onboarding").eq("id", user.id).maybeSingle();

  // Seul le démarrage d'un entretien compte dans le quota du jour.
  const starting = history.length === 0;
  if (starting) {
    const limited = await quotaError(supabase, user);
    if (limited) return limited;
  }

  const context = `<offre>\nPoste : ${jobTitle}\nEntreprise : ${(body.company ?? "").trim().slice(0, 200) || "non précisée"}\n${(body.jobDescription ?? "").trim().slice(0, 12000)}\n</offre>\n\n<candidat>\nNom : ${profile?.full_name ?? ""}\n${describeSearch(profile?.onboarding)}\n${profile?.background?.trim() || "(Parcours non renseigné.)"}\n</candidat>`;

  return streamCompletion({
    messages: [
      { role: "system", content: `${SYSTEM}\n\n${context}` },
      ...(starting ? [{ role: "user" as const, content: "Bonjour, je suis prêt·e à commencer l'entretien." }] : history),
    ],
    maxTokens: 1200,
    signal: request.signal,
    onStart: async () => {
      if (starting) await supabase.from("generations").insert({ kind: "interview" });
    },
  });
}
