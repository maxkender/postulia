import { HONESTY, aiConfigured, notConfigured, quotaError, streamCompletion } from "@/lib/ai";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 300;

const SYSTEM = `Tu es un conseiller en recrutement francophone expérimenté. Tu rédiges des CV et des lettres de motivation pour le marché du travail français.

Règles :
- ${HONESTY}
- Adapte le contenu à l'offre visée : reprends son vocabulaire et mets en avant les expériences les plus pertinentes, afin que le document passe aussi bien auprès d'un logiciel de tri que d'un recruteur.
- Écris dans un français naturel et direct, sans formules creuses.
- Réponds uniquement avec le document, sans introduction ni commentaire.

Format :
- CV : Markdown. Le nom en titre de niveau 1, une ligne d'accroche, puis des sections de niveau 2 (Profil, Expériences, Formation, Compétences, et Langues ou Centres d'intérêt si le parcours en donne). Les expériences en ordre antichronologique, avec des puces qui commencent par un verbe d'action. Une page.
- Lettre de motivation : texte simple sans Markdown, avec en-tête, objet, formule d'appel, trois ou quatre paragraphes et formule de politesse. Moins de 350 mots.`;

type Body = { kind?: string; jobTitle?: string; company?: string; jobDescription?: string; instructions?: string };

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Connexion requise." }, { status: 401 });
  if (!aiConfigured()) return notConfigured();

  const body = (await request.json().catch(() => ({}))) as Body;
  const kind = body.kind === "letter" ? "letter" : "cv";
  const jobTitle = (body.jobTitle ?? "").trim().slice(0, 200);
  const company = (body.company ?? "").trim().slice(0, 200);
  const jobDescription = (body.jobDescription ?? "").trim();
  const instructions = (body.instructions ?? "").trim().slice(0, 1000);
  if (!jobTitle) return Response.json({ error: "Indique le poste visé." }, { status: 400 });
  if (jobDescription.length > 20000) {
    return Response.json({ error: "L'offre est trop longue (20 000 caractères maximum)." }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, headline, background")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.background?.trim()) {
    return Response.json({ error: "Renseigne d'abord ton parcours dans « Profil »." }, { status: 400 });
  }

  const limited = await quotaError(supabase, user);
  if (limited) return limited;

  const prompt = [
    kind === "cv" ? "Rédige un CV adapté à l'offre ci-dessous." : "Rédige une lettre de motivation pour l'offre ci-dessous.",
    `<candidat>\nNom : ${profile.full_name ?? ""}\nTitre : ${profile.headline ?? ""}\nE-mail : ${user.email ?? ""}\n\nParcours :\n${profile.background}\n</candidat>`,
    `<offre>\nPoste : ${jobTitle}\nEntreprise : ${company || "non précisée"}\n\n${jobDescription || "(Pas de description fournie.)"}\n</offre>`,
    instructions ? `<consignes>\n${instructions}\n</consignes>` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return streamCompletion({
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: prompt },
    ],
    signal: request.signal,
    onStart: () => supabase.from("generations").insert({ kind }),
  });
}
