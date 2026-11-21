import { jobSources, searchJobs } from "@/lib/jobs";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 30;

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Connexion requise." }, { status: 401 });

  const params = new URL(request.url).searchParams;
  const q = (params.get("q") ?? "").trim().slice(0, 100);
  const country = (params.get("country") ?? "").trim().toUpperCase().slice(0, 2);
  if (q.length < 2) return Response.json({ error: "Indique un poste ou un mot-clé." }, { status: 400 });
  if (country && !/^[A-Z]{2}$/.test(country)) return Response.json({ error: "Pays invalide." }, { status: 400 });

  const { jobs, failed } = await searchJobs(
    { q, country, countryName: (params.get("countryName") ?? "").trim().slice(0, 60), where: (params.get("where") ?? "").trim().slice(0, 80) },
    params.get("remote") === "1",
  );
  return Response.json({ jobs, failed, sources: jobSources() });
}
