import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Editor } from "@/components/portal/editor";
import { Notice, PortalShell, type Params } from "@/components/portal/ui";
import { getType } from "@/lib/portal/registry";
import { requirePortal } from "@/lib/supabase/server";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page({ params, searchParams }: { params: Promise<{ table: string }>; searchParams: Promise<Params> }) {
  const { table } = await params;
  const ct = getType(table);
  if (!ct) notFound();
  const sp = await searchParams;
  const s = await requirePortal("contributor");
  return (
    <PortalShell session={s} title={`New ${ct.singular.toLowerCase()}`} current={`/employee/content/${table}`}>
      <Notice params={sp} />
      <Editor ct={ct} table={table} row={null} revisions={[]} profile={s.profile} names={{}} />
    </PortalShell>
  );
}
