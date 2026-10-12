import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MfaEnroll } from "@/components/portal/mfa-enroll";
import { AuthScreen, Btn, inputClass, Label, Notice, type Params } from "@/components/portal/ui";
import { signOut, verifyMfa } from "@/lib/portal/actions";
import { getPortalSession } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Verify it's you", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const s = await getPortalSession();
  if (!s) redirect("/employee");
  if (s.aal === "aal2") redirect("/employee/dashboard");
  const { data } = await s.client.auth.mfa.listFactors();
  const factor = (data?.totp ?? []).find((f) => f.status === "verified");

  return (
    <AuthScreen
      title={factor ? "Enter your verification code" : "Set up two-step verification"}
      lead={factor ? `Open your authenticator app and enter the current code for ${s.user.email}.` : `Signed in as ${s.user.email}. One more step before the portal opens.`}
      footer={<form action={signOut}><button type="submit" className="text-sky hover:text-white">Sign out</button></form>}
    >
      <Notice params={params} />
      {factor ? (
        <form action={verifyMfa} className="space-y-4">
          <input type="hidden" name="factorId" value={factor.id} />
          <div>
            <Label htmlFor="code">6-digit code</Label>
            <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" required autoFocus className={`${inputClass} mt-1 text-center font-mono text-lg tracking-[0.3em]`} />
          </div>
          <Btn type="submit" className="w-full">Verify</Btn>
        </form>
      ) : (
        <MfaEnroll />
      )}
    </AuthScreen>
  );
}
