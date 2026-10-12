import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthScreen, Btn, inputClass, Label, Notice, type Params } from "@/components/portal/ui";
import { setPassword } from "@/lib/portal/actions";
import { getPortalSession } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Set your password", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const s = await getPortalSession();
  if (!s) redirect("/employee?error=Your+link+has+expired.+Ask+an+admin+for+a+new+invitation+or+request+a+reset.");
  return (
    <AuthScreen title="Choose a password" lead={<>For <strong>{s.user.email}</strong>. Use at least 12 characters; a passphrase works well.</>}>
      <Notice params={params} />
      <form action={setPassword} className="space-y-4">
        <div><Label htmlFor="password">New password</Label><input id="password" name="password" type="password" autoComplete="new-password" minLength={12} required className={`${inputClass} mt-1`} /></div>
        <div><Label htmlFor="confirm">Confirm password</Label><input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={12} required className={`${inputClass} mt-1`} /></div>
        <Btn type="submit" className="w-full">Save password</Btn>
      </form>
    </AuthScreen>
  );
}
