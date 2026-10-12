import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthScreen, Btn, inputClass, Label, Notice, one, type Params } from "@/components/portal/ui";
import { requestPasswordReset, signIn } from "@/lib/portal/actions";
import { getPortalSession, supabaseConfigured } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Employee Portal", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;

  if (!supabaseConfigured()) {
    return (
      <AuthScreen title="Portal not configured" lead="The employee portal needs a Supabase project before anyone can sign in.">
        <ol className="list-decimal space-y-2 pl-5 text-sm text-ink-muted">
          <li>Create the Supabase project and apply <code className="font-mono text-xs">supabase/migrations</code>.</li>
          <li>Set <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code>, <code className="font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> and <code className="font-mono text-xs">SUPABASE_SERVICE_ROLE_KEY</code>.</li>
          <li>Insert the first super admin (see docs/04-OPERATIONS.md) and sign in here.</li>
        </ol>
        <p className="mt-6 text-sm"><Link href="/" className="font-semibold text-cobalt hover:underline">Back to the public site</Link></p>
      </AuthScreen>
    );
  }

  const s = await getPortalSession();
  if (s) redirect(s.aal === "aal2" ? "/employee/dashboard" : "/employee/mfa");

  const reset = one(params, "reset") === "1";
  return (
    <AuthScreen
      title={reset ? "Reset your password" : "Sign in"}
      lead={reset ? "Enter your work email. If it belongs to an employee account we will send a reset link." : "Invite-only. Use your employee email, password and authenticator app."}
      footer={<>Authorized personnel only. All activity is logged. <Link href="/" className="text-sky hover:text-white">Public site</Link></>}
    >
      <Notice params={params} />
      {reset ? (
        <form action={requestPasswordReset} className="space-y-4">
          <div><Label htmlFor="email">Email</Label><input id="email" name="email" type="email" autoComplete="email" required className={`${inputClass} mt-1`} /></div>
          <Btn type="submit" className="w-full">Send reset link</Btn>
          <p className="text-center text-sm"><Link href="/employee" className="font-semibold text-cobalt hover:underline">Back to sign in</Link></p>
        </form>
      ) : (
        <form action={signIn} className="space-y-4">
          <div><Label htmlFor="email">Email</Label><input id="email" name="email" type="email" autoComplete="username" required className={`${inputClass} mt-1`} /></div>
          <div><Label htmlFor="password">Password</Label><input id="password" name="password" type="password" autoComplete="current-password" required className={`${inputClass} mt-1`} /></div>
          <Btn type="submit" className="w-full">Continue</Btn>
          <p className="text-center text-sm"><Link href="/employee?reset=1" className="font-semibold text-cobalt hover:underline">Forgot your password?</Link></p>
        </form>
      )}
    </AuthScreen>
  );
}
