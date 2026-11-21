import { createClient } from "@supabase/supabase-js";

/** Client serveur avec la clé secrète : contourne la RLS. À n'utiliser que dans les routes serveur. */
export function createAdminClient() {
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
