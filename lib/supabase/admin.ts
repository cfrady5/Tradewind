import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client. SERVER ONLY — this key bypasses RLS. It is used for exactly two things:
 * sending invites (Auth admin API) and recording failed sign-in attempts that have no user yet.
 * Never import this module from a client component.
 */
export function adminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
