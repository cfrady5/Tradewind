import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Editor } from "@/components/portal/editor";
import { Notice, PortalShell, type Params } from "@/components/portal/ui";
import { getRecord, getRevisions, listUsers } from "@/lib/portal/queries";
import { getType } from "@/lib/portal/registry";
import { requirePortal } from "@/lib/supabase/server";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page({ params, searchParams }: { params: Promise<{ table: string; id: string }>; searchParams: Promise<Params> }) {
  const { table, id } = await params;
  const ct = getType(table);
  if (!ct) notFound();
  const sp = await searchParams;
  const s = await requirePortal();
  const [row, revisions, users] = await Promise.all([getRecord(s.client, ct, id), getRevisions(s.client, ct, id), listUsers(s.client)]);
  if (!row) notFound();
  const names = Object.fromEntries(users.map((u) => [String(u.user_id), String(u.display_name || u.email)]));
  return (
    <PortalShell session={s} title={String(row[ct.titleField] ?? ct.singular)} current={`/employee/content/${table}`}>
      <Notice params={sp} />
      <Editor ct={ct} table={table} row={row} revisions={revisions} profile={s.profile} names={names} />
    </PortalShell>
  );
}
