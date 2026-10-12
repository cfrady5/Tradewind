import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { DotTitle } from "@/components/brand/dot-title";
import { MonogramField } from "@/components/brand/monogram-field";
import { one, StatusBadge, type Params } from "@/components/portal/ui";
import { getRecord } from "@/lib/portal/queries";
import { COMMON_FIELDS, getType } from "@/lib/portal/registry";
import { requirePortal } from "@/lib/supabase/server";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Draft preview (brief §13): renders the record with the public page header so reviewers see it in context. */
export default async function Page({ params, searchParams }: { params: Promise<{ table: string; id: string }>; searchParams: Promise<Params> }) {
  const { table, id } = await params;
  const ct = getType(table);
  if (!ct) notFound();
  const sp = await searchParams;
  const s = await requirePortal();
  const base = await getRecord(s.client, ct, id);
  if (!base) notFound();
  const usePending = one(sp, "pending") === "1" && base.pending && typeof base.pending === "object";
  const row = usePending ? { ...base, ...(base.pending as Record<string, unknown>) } : base;
  const title = String(row[ct.titleField] ?? ct.singular);
  const lead = [row.summary, row.hero_lead, row.tagline, row.description, row.answer].find((v) => typeof v === "string" && v) as string | undefined;
  const fields = [...ct.fields.filter((f) => !f.restricted && f.name !== ct.titleField), ...COMMON_FIELDS];
  const show = (v: unknown) => (v === null || v === undefined || v === "" ? null : Array.isArray(v) ? v.join(", ") : typeof v === "object" ? JSON.stringify(v, null, 1) : String(v));

  return (
    <div className="min-h-dvh bg-white text-navy">
      <div className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-runway/50 bg-runway-tint px-5 py-2 text-sm">
        <p><strong>Preview</strong> — {usePending ? "pending changes" : "current saved version"} of this {ct.singular.toLowerCase()}. Not visible to the public.</p>
        <Link href={`/employee/content/${table}/${id}`} className="font-semibold text-cobalt hover:underline">Back to editor</Link>
      </div>
      <section className="on-dark relative isolate overflow-hidden bg-hero text-white">
        <div className="absolute inset-0 -z-10 bg-grid-fine [mask-image:linear-gradient(to_bottom,black,transparent)]" aria-hidden />
        <MonogramField variant="page" className="absolute inset-0 -z-10 hidden h-full w-full md:block" />
        <div className="container-page pb-14 pt-10">
          <Breadcrumbs items={[{ label: ct.label, href: ct.publicPath?.(row) ?? "/" }, { label: title, href: "#" }]} />
          <div className="mt-8 flex flex-wrap items-center gap-3"><StatusBadge status={String(row.status)} /></div>
          <h1 className="mt-4 text-h1 font-bold"><DotTitle>{title}</DotTitle></h1>
          {lead && <p className="mt-6 max-w-2xl text-lead text-white/80">{lead}</p>}
        </div>
      </section>
      <div className="container-page py-12">
        <dl className="grid gap-x-10 gap-y-5 md:grid-cols-2">
          {fields.map((f) => {
            const v = show(row[f.name]);
            if (v === null) return null;
            return (
              <div key={f.name} className={f.wide ? "md:col-span-2" : undefined}>
                <dt className="eyebrow text-ink-muted">{f.label}</dt>
                <dd className="mt-2 whitespace-pre-wrap text-[0.9375rem] leading-relaxed">{v}</dd>
              </div>
            );
          })}
        </dl>
      </div>
    </div>
  );
}
