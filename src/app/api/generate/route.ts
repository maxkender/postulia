import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 300;

const DAILY_LIMIT = 20;

const SYSTEM = `Tu es un conseiller en recrutement francophone expérimenté. Tu rédiges des CV et des lettres de motivation pour le marché du travail français.

Règles :
- Appuie-toi uniquement sur le parcours fourni par la personne. N'invente jamais de diplôme, d'employeur, de date, de chiffre ou de compétence. S'il manque une information utile, laisse un repère entre crochets, par exemple [date] ou [résultat chiffré], pour qu'elle le complète.
- Adapte le contenu à l'offre visée : reprends son vocabulaire et mets en avant les expériences les plus pertinentes, afin que le document passe aussi bien auprès d'un logiciel de tri que d'un recruteur.
- Écris dans un français naturel et direct, sans formules creuses.
- Réponds uniquement avec le document, sans introduction ni commentaire.

Format :
- CV : Markdown. Le nom en titre de niveau 1, une ligne d'accroche, puis des sections de niveau 2 (Profil, Expériences, Formation, Compétences, et Langues ou Centres d'intérêt si le parcours en donne). Les expériences en ordre antichronologique, avec des puces qui commencent par un verbe d'action. Une page.
- Lettre de motivation : texte simple sans Markdown, avec en-tête, objet, formule d'appel, trois ou quatre paragraphes et formule de politesse. Moins de 350 mots.`;

type Body = {
  kind?: string;
  jobTitle?: string;
  company?: string;
  jobDescription?: string;
  instructions?: string;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Connexion requise." }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "La génération IA n'est pas encore configurée (clé ANTHROPIC_API_KEY manquante)." },
      { status: 503 },
    );
  }

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
    return Response.json(
      { error: "Renseigne d'abord ton parcours dans « Mon profil »." },
      { status: 400 },
    );
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("generations")
    .select("id", { count: "exact", head: true })
    .gte("created_at", since);
  if ((count ?? 0) >= DAILY_LIMIT) {
    return Response.json(
      { error: `Limite de ${DAILY_LIMIT} générations par 24 h atteinte. Réessaie plus tard.` },
      { status: 429 },
    );
  }
  await supabase.from("generations").insert({ kind });

  const prompt = [
    kind === "cv"
      ? "Rédige un CV adapté à l'offre ci-dessous."
      : "Rédige une lettre de motivation pour l'offre ci-dessous.",
    `<candidat>\nNom : ${profile.full_name ?? ""}\nTitre : ${profile.headline ?? ""}\nE-mail : ${user.email ?? ""}\n\nParcours :\n${profile.background}\n</candidat>`,
    `<offre>\nPoste : ${jobTitle}\nEntreprise : ${company || "non précisée"}\n\n${jobDescription || "(Pas de description fournie.)"}\n</offre>`,
    instructions ? `<consignes>\n${instructions}\n</consignes>` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const client = new Anthropic();
  const stream = client.beta.messages.stream({
    model: "claude-opus-5-5",
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "medium" },
    system: SYSTEM,
    messages: [{ role: "user", content: prompt }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      stream.on("text", (text) => controller.enqueue(encoder.encode(text)));
      try {
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(encoder.encode("\n\n[La génération n'a pas pu aboutir pour cette demande.]"));
        } else if (final.stop_reason === "max_tokens") {
          controller.enqueue(encoder.encode("\n\n[Document tronqué : longueur maximale atteinte.]"));
        }
        controller.close();
      } catch (error) {
        if (error instanceof Anthropic.APIError) {
          console.error(`Claude API ${error.status}: ${error.message}`);
        } else {
          console.error(error);
        }
        controller.error(error);
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
