import type { Metadata } from "next";
import { Btn, Card, inputClass, Label, Notice, PortalShell, type Params } from "@/components/portal/ui";
import { saveSettings } from "@/lib/portal/actions";
import { SETTING_KEYS } from "@/lib/portal/registry";
import { getSettings } from "@/lib/portal/queries";
import { requirePortal } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Settings", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const s = await requirePortal("admin");
  const settings = await getSettings(s.client);
  return (
    <PortalShell session={s} title="Settings" current="/employee/settings">
      <Notice params={sp} />
      <Card title="Site settings" className="max-w-2xl">
        <form action={saveSettings} className="space-y-4">
          {SETTING_KEYS.map((k) => (
            <div key={k.key}>
              <Label htmlFor={k.key}>{k.label}</Label>
              <input id={k.key} name={k.key} type={k.type} defaultValue={typeof settings[k.key] === "string" ? (settings[k.key] as string) : ""} className={`${inputClass} mt-1`} />
            </div>
          ))}
          <Btn type="submit">Save settings</Btn>
        </form>
      </Card>
      <Card title="Security" className="mt-6 max-w-2xl">
        <ul className="list-disc space-y-1 pl-5 text-sm text-ink-muted">
          <li>Accounts are invite-only; every employee needs an authenticator app.</li>
          <li>Sessions end after 30 minutes of inactivity.</li>
          <li>Sign-in attempts are throttled and logged; audit logs are immutable.</li>
          <li>Private files live in a non-public bucket readable only by portal users.</li>
        </ul>
      </Card>
    </PortalShell>
  );
}
