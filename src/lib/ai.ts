import type { SupabaseClient, User } from "@supabase/supabase-js";
import { PLANS, isActive } from "@/lib/stripe";

const FAL_URL = "https://fal.run/openrouter/router/openai/v1/chat/completions";
const FAL_MODEL = process.env.FAL_MODEL ?? "anthropic/claude-sonnet-4.5";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export const HONESTY = `Appuie-toi uniquement sur les informations fournies par la personne. N'invente jamais de diplôme, d'employeur, de date, de chiffre, de compétence ni de détail (taille ou composition d'équipe, outils, résultats) qui n'y figure pas. S'il manque une information utile, laisse un repère entre crochets, par exemple [date] ou [résultat chiffré].`;

export function aiConfigured() {
  return Boolean(process.env.FAL_API_KEY ?? process.env.FAL_KEY);
}

export function notConfigured() {
  return Response.json({ error: "La génération IA n'est pas encore configurée." }, { status: 503 });
}

/** Vérifie le quota du jour. Renvoie une réponse d'erreur si la limite est atteinte, sinon null. */
export async function quotaError(supabase: SupabaseClient, user: User) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const [{ count }, { data: sub }] = await Promise.all([
    supabase.from("generations").select("id", { count: "exact", head: true }).gte("created_at", since).neq("kind", "import"),
    supabase.from("subscriptions").select("status").eq("user_id", user.id).maybeSingle(),
  ]);
  const pro = isActive(sub?.status);
  const limit = pro ? PLANS.pro.dailyGenerations : PLANS.free.dailyGenerations;
  if ((count ?? 0) < limit) return null;
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

/**
 * Appelle le modèle via fal (format « chat completions », flux SSE) et renvoie
 * une réponse HTTP qui ne diffuse que le texte généré.
 */
export async function streamCompletion(opts: {
  messages: ChatMessage[];
  maxTokens?: number;
  signal?: AbortSignal;
  onStart?: () => PromiseLike<unknown>;
}) {
  const key = process.env.FAL_API_KEY ?? process.env.FAL_KEY;
  const upstream = await fetch(FAL_URL, {
    method: "POST",
    headers: { Authorization: `Key ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: FAL_MODEL, stream: true, max_tokens: opts.maxTokens ?? 4000, messages: opts.messages }),
    signal: opts.signal,
  }).catch((error) => {
    console.error(error);
    return null;
  });

  if (!upstream?.ok || !upstream.body) {
    if (upstream) console.error(`fal ${upstream.status}: ${(await upstream.text()).slice(0, 500)}`);
    return Response.json({ error: "Le service de rédaction est indisponible. Réessaie dans un instant." }, { status: 502 });
  }
  await opts.onStart?.();

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
        if (finish === "length") controller.enqueue(encoder.encode("\n\n[Réponse tronquée : longueur maximale atteinte.]"));
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

/** Appel simple, sans flux : renvoie le texte complet, ou null en cas d'échec. */
export async function complete(messages: ChatMessage[], maxTokens = 1500) {
  const key = process.env.FAL_API_KEY ?? process.env.FAL_KEY;
  try {
    const res = await fetch(FAL_URL, {
      method: "POST",
      headers: { Authorization: `Key ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: FAL_MODEL, max_tokens: maxTokens, messages }),
    });
    if (!res.ok) {
      console.error(`fal ${res.status}: ${(await res.text()).slice(0, 500)}`);
      return null;
    }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    return typeof content === "string" ? content : null;
  } catch (error) {
    console.error(error);
    return null;
  }
}
