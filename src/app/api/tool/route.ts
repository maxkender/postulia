import { aiConfigured, notConfigured, quotaError, streamCompletion } from "@/lib/ai";
import { describeSearch } from "@/lib/onboarding";
import { createClient } from "@/lib/supabase/server";
import { getTool } from "@/lib/tools";

export const maxDuration = 300;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Connexion requise." }, { status: 401 });
  if (!aiConfigured()) return notConfigured();

  const body = (await request.json().catch(() => ({}))) as { tool?: string; values?: Record<string, unknown> };
  const tool = getTool(body.tool ?? "");
  if (!tool) return Response.json({ error: "Outil inconnu." }, { status: 400 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, headline, background, onboarding")
    .eq("id", user.id)
    .maybeSingle();
  const background = profile?.background?.trim() ?? "";

  const parts: string[] = [];
  for (const field of tool.fields) {
    let value = String(body.values?.[field.id] ?? "").trim().slice(0, 20000);
    if (!value && field.profileFallback) value = background;
    if (!value && (field.required || field.profileFallback)) {
      return Response.json(
        { error: field.profileFallback ? "Colle ton CV, ou renseigne ton parcours dans « Profil »." : `Champ requis : ${field.label}.` },
        { status: 400 },
      );
    }
    if (value) parts.push(`<${field.id}>\n${value}\n</${field.id}>`);
  }
  if (background && !tool.fields.some((f) => f.profileFallback)) {
    parts.push(`<parcours_du_candidat>\nNom : ${profile?.full_name ?? ""}\nTitre : ${profile?.headline ?? ""}\n${describeSearch(profile?.onboarding)}\n${background}\n</parcours_du_candidat>`);
  }

  const limited = await quotaError(supabase, user);
  if (limited) return limited;

  return streamCompletion({
    messages: [
      { role: "system", content: tool.system },
      { role: "user", content: parts.join("\n\n") },
    ],
    signal: request.signal,
    onStart: () => supabase.from("generations").insert({ kind: `tool:${tool.id}` }),
  });
}
