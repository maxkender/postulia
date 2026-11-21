import { PLANS, isActive } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 300;

const FAL_URL = "https://fal.run/openrouter/router/openai/v1/chat/completions";
const FAL_MODEL = process.env.FAL_MODEL ?? "anthropic/claude-sonnet-4.5";

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

  const falKey = process.env.FAL_API_KEY ?? process.env.FAL_KEY;
  if (!falKey) {
    return Response.json(
      { error: "La génération IA n'est pas encore configurée." },
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
  const [{ count }, { data: sub }] = await Promise.all([
    supabase.from("generations").select("id", { count: "exact", head: true }).gte("created_at", since),
    supabase.from("subscriptions").select("status").eq("user_id", user.id).maybeSingle(),
  ]);
  const pro = isActive(sub?.status);
  const limit = pro ? PLANS.pro.dailyGenerations : PLANS.free.dailyGenerations;
  if ((count ?? 0) >= limit) {
    return Response.json(
      {
        error: pro
          ? `Limite de ${limit} générations par 24 h atteinte. Réessaie plus tard.`
          : `Tu as utilisé tes ${limit} générations gratuites du jour. Passe à Pro pour continuer.`,
        upgrade: !pro,
      },
      { status: 429 },
    );
  }
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

  const upstream = await fetch(FAL_URL, {
    method: "POST",
    headers: { Authorization: `Key ${falKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: FAL_MODEL,
      stream: true,
      max_tokens: 4000,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: prompt },
      ],
    }),
    signal: request.signal,
  }).catch((error) => {
    console.error(error);
    return null;
  });

  if (!upstream?.ok || !upstream.body) {
    if (upstream) console.error(`fal ${upstream.status}: ${(await upstream.text()).slice(0, 500)}`);
    return Response.json({ error: "Le service de rédaction est indisponible. Réessaie dans un instant." }, { status: 502 });
  }
  await supabase.from("generations").insert({ kind });

  // Le flux amont est au format SSE « chat completions » : on n'en renvoie que le texte.
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = upstream.body.getReader();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = "";
      let finish: string | null = null;
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const data = line.startsWith("data:") ? line.slice(5).trim() : "";
            if (!data || data === "[DONE]") continue;
            try {
              const choice = JSON.parse(data).choices?.[0];
              if (choice?.delta?.content) controller.enqueue(encoder.encode(choice.delta.content));
              if (choice?.finish_reason) finish = choice.finish_reason;
            } catch {
              // ligne incomplète ou commentaire SSE : ignorée
            }
          }
        }
        if (finish === "length") controller.enqueue(encoder.encode("\n\n[Document tronqué : longueur maximale atteinte.]"));
        controller.close();
      } catch (error) {
        console.error(error);
        controller.error(error);
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
