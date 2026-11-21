export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  description: string;
  source: string;
  remote: boolean;
  date: string | null;
};

type Query = { q: string; country: string; countryName: string; where: string };

function strip(html: unknown) {
  return String(html ?? "")
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6])[^>]*>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#0?39;|&rsquo;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*/g, "\n\n")
    .trim()
    .slice(0, 15000);
}

async function getJson(url: string, init?: RequestInit) {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(9000), headers: { Accept: "application/json", "User-Agent": "JobSearch/1.0", ...(init?.headers ?? {}) } });
  if (!res.ok) throw new Error(`${new URL(url).hostname} ${res.status}`);
  return res.json();
}

const words = (q: string) => q.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
const matches = (text: string, q: string) => {
  const w = words(q);
  const t = text.toLowerCase();
  return !w.length || w.every((x) => t.includes(x));
};

// Sources d'offres qui autorisent la réutilisation de leurs données via une API publique.
// Jooble et Adzuna couvrent les postes sur site dans des dizaines de pays et demandent une clé gratuite.

async function jooble({ q, country, countryName, where }: Query): Promise<Job[]> {
  const key = process.env.JOOBLE_API_KEY;
  if (!key) return [];
  const host = country && country !== "US" ? `${country.toLowerCase()}.jooble.org` : "jooble.org";
  const data = await getJson(`https://${host}/api/${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keywords: q, location: where || countryName || "", page: 1 }),
  });
  return (data.jobs ?? []).slice(0, 25).map((j: Record<string, unknown>) => ({
    id: `jooble-${j.id}`,
    title: strip(j.title),
    company: strip(j.company) || "Entreprise non précisée",
    location: strip(j.location),
    url: String(j.link ?? ""),
    description: strip(j.snippet),
    source: "Jooble",
    remote: /remote|télétravail/i.test(`${j.title} ${j.location} ${j.type}`),
    date: typeof j.updated === "string" ? j.updated : null,
  }));
}

const ADZUNA = new Set(["AT", "AU", "BE", "BR", "CA", "CH", "DE", "ES", "FR", "GB", "IN", "IT", "MX", "NL", "NZ", "PL", "SG", "US", "ZA"]);

async function adzuna({ q, country, where }: Query): Promise<Job[]> {
  const id = process.env.ADZUNA_APP_ID;
  const key = process.env.ADZUNA_APP_KEY;
  if (!id || !key || !ADZUNA.has(country)) return [];
  const params = new URLSearchParams({ app_id: id, app_key: key, what: q, results_per_page: "25" });
  if (where) params.set("where", where);
  const data = await getJson(`https://api.adzuna.com/v1/api/jobs/${country.toLowerCase()}/search/1?${params}`);
  return (data.results ?? []).map((j: Record<string, unknown>) => ({
    id: `adzuna-${j.id}`,
    title: strip(j.title),
    company: strip((j.company as { display_name?: string })?.display_name) || "Entreprise non précisée",
    location: strip((j.location as { display_name?: string })?.display_name),
    url: String(j.redirect_url ?? ""),
    description: strip(j.description),
    source: "Adzuna",
    remote: /remote|télétravail/i.test(`${j.title} ${j.description}`),
    date: typeof j.created === "string" ? j.created : null,
  }));
}

async function remotive({ q }: Query): Promise<Job[]> {
  const data = await getJson(`https://remotive.com/api/remote-jobs?limit=25&search=${encodeURIComponent(q)}`);
  return (data.jobs ?? []).slice(0, 25).map((j: Record<string, unknown>) => ({
    id: `remotive-${j.id}`,
    title: strip(j.title),
    company: strip(j.company_name),
    location: strip(j.candidate_required_location) || "Télétravail",
    url: String(j.url ?? ""),
    description: strip(j.description),
    source: "Remotive",
    remote: true,
    date: typeof j.publication_date === "string" ? j.publication_date : null,
  }));
}

async function arbeitnow({ q }: Query): Promise<Job[]> {
  const data = await getJson("https://www.arbeitnow.com/api/job-board-api");
  return (data.data ?? [])
    .filter((j: Record<string, unknown>) => matches(`${j.title} ${(j.tags as string[] | undefined)?.join(" ") ?? ""}`, q))
    .slice(0, 25)
    .map((j: Record<string, unknown>) => ({
      id: `arbeitnow-${j.slug}`,
      title: strip(j.title),
      company: strip(j.company_name),
      location: strip(j.location),
      url: String(j.url ?? ""),
      description: strip(j.description),
      source: "Arbeitnow",
      remote: Boolean(j.remote),
      date: typeof j.created_at === "number" ? new Date(j.created_at * 1000).toISOString() : null,
    }));
}

export function jobSources() {
  return { jooble: Boolean(process.env.JOOBLE_API_KEY), adzuna: Boolean(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY) };
}

export async function searchJobs(query: Query, remoteOnly: boolean) {
  const providers = [jooble, adzuna, remotive, arbeitnow];
  const settled = await Promise.allSettled(providers.map((p) => p(query)));
  const failed: string[] = [];
  let jobs: Job[] = [];
  settled.forEach((r, i) => {
    if (r.status === "fulfilled") jobs = jobs.concat(r.value);
    else {
      failed.push(providers[i].name);
      console.error(`jobs:${providers[i].name}`, r.reason);
    }
  });
  const seen = new Set<string>();
  jobs = jobs.filter((j) => {
    const key = `${j.title}|${j.company}`.toLowerCase();
    if (!j.title || !/^https?:\/\//i.test(j.url) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (remoteOnly) jobs = jobs.filter((j) => j.remote);
  // Les offres du pays demandé d'abord (les sources par pays), puis le télétravail.
  const local = jobs.filter((j) => j.source === "Jooble" || j.source === "Adzuna");
  const rest = jobs.filter((j) => j.source !== "Jooble" && j.source !== "Adzuna");
  return { jobs: [...local, ...rest].slice(0, 60), failed };
}
