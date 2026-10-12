import type { Metadata } from "next";
import { AuthScreen } from "@/components/portal/ui";
import { signOut } from "@/lib/portal/actions";
import { getPortalSession } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "No portal access", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page() {
  const s = await getPortalSession();
  const disabled = s?.profile?.status === "disabled";
  return (
    <AuthScreen title={disabled ? "This account is disabled" : "No portal access"} lead={disabled ? "An administrator disabled this account." : "Your sign-in worked, but this email has not been invited to the employee portal."}>
      <p className="text-sm text-ink-muted">Contact a portal administrator if you believe this is a mistake. Access is invite-only and every attempt is logged.</p>
      <form action={signOut} className="mt-6"><button type="submit" className="text-sm font-semibold text-cobalt hover:underline">Sign out</button></form>
    </AuthScreen>
  );
}
