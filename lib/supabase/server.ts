import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { atLeast, type PortalProfile, type PortalRole } from "@/lib/portal/roles";

export { ROLES, roleRank, atLeast, type PortalRole, type PortalProfile } from "@/lib/portal/roles";

export type PortalSession = {
  client: SupabaseClient;
  user: User;
  profile: PortalProfile | null;
  /** Authenticator assurance level of the current session: aal2 = second factor verified. */
  aal: "aal1" | "aal2";
  /** The user has at least one verified TOTP factor. */
  enrolled: boolean;
};

export function supabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Supabase client bound to the signed-in employee's cookies. Every query runs under that user's
 * RLS policies, so the database — not this code — is the final authority on what they may see or change.
 */
export async function createPortalClient(): Promise<SupabaseClient> {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Server Components cannot set cookies; proxy.ts refreshes the session on each request instead.
        }
      },
    },
  });
}

export async function getPortalSession(): Promise<PortalSession | null> {
  if (!supabaseConfigured()) return null;
  const client = await createPortalClient();
  const { data: { user } } = await client.auth.getUser(); // validated against Auth, not just the cookie
  if (!user) return null;
  const [{ data: aal }, { data: factors }, { data: profile }] = await Promise.all([
    client.auth.mfa.getAuthenticatorAssuranceLevel(),
    client.auth.mfa.listFactors(),
    client.from("portal_users").select("user_id, email, display_name, role, status, last_sign_in_at, created_at").eq("user_id", user.id).maybeSingle(),
  ]);
  return {
    client,
    user,
    profile: (profile as PortalProfile | null) ?? null,
    aal: aal?.currentLevel === "aal2" ? "aal2" : "aal1",
    enrolled: (factors?.totp ?? []).some((f) => f.status === "verified"),
  };
}

/** Gate for every portal page: signed in, second factor verified, active account, sufficient role. */
export async function requirePortal(min: PortalRole = "viewer"): Promise<PortalSession & { profile: PortalProfile }> {
  if (!supabaseConfigured()) redirect("/employee");
  const s = await getPortalSession();
  if (!s) redirect("/employee");
  if (s.aal !== "aal2") redirect("/employee/mfa");
  if (!s.profile || s.profile.status === "disabled") redirect("/employee/no-access");
  if (s.profile.status === "invited") {
    // First verified sign-in activates an invited account.
    await s.client.rpc("portal_touch_sign_in");
    const again = await getPortalSession();
    if (!again?.profile || again.profile.status !== "active") redirect("/employee/no-access");
    return { ...again, profile: again.profile };
  }
  if (!atLeast(s.profile.role, min)) redirect("/employee/dashboard?denied=1");
  return { ...s, profile: s.profile };
}
