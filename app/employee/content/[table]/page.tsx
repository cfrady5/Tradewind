import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Btn, BtnLink, fmtDateTime, inputClass, Notice, one, PortalShell, StatusBadge, Table, td, th, type Params } from "@/components/portal/ui";
import { bulkArchive } from "@/lib/portal/actions";
import { listContent, PAGE_SIZE } from "@/lib/portal/queries";
import { getType, STATUS_LABEL, STATUSES } from "@/lib/portal/registry";
import { atLeast, requirePortal } from "@/lib/supabase/server";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page({ params, searchParams }: { params: Promise<{ table: string }>; searchParams: Promise<Params> }) {
  const { table } = await params;
  const ct = getType(table);
  if (!ct) notFound();
  const sp = await searchParams;
  const s = await requirePortal();
  const q = one(sp, "q"), status = one(sp, "status"), filter = one(sp, "filter"), page = Number(one(sp, "page") || 1);
  const { rows, count, error } = await listContent(s.client, ct, { q, status, filter, page });
  const isAdmin = atLeast(s.profile.role, "admin");
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const link = (p: number) => `/employee/content/${table}?${new URLSearchParams({ q, status, filter, page: String(p) })}`;
  const cell = (v: unknown) => (v === null || v === undefined ? "—" : typeof v === "boolean" ? (v ? "Yes" : "No") : /^\d{4}-\d{2}-\d{2}T/.test(String(v)) ? fmtDateTime(v) : String(v));

  return (
    <PortalShell session={s} title={ct.label} current={`/employee/content/${table}`} actions={atLeast(s.profile.role, "contributor") ? <BtnLink href={`/employee/content/${table}/new`}>New {ct.singular.toLowerCase()}</BtnLink> : undefined}>
      <Notice params={sp} />
      {error && <p role="alert" className="mb-4 text-sm text-[#8a1c1c]">{error}</p>}
      <p className="mb-4 text-sm text-ink-muted">{ct.description}</p>
      <form className="mb-4 flex flex-wrap items-end gap-2">
        <input name="q" defaultValue={q} placeholder={`Search ${ct.label.toLowerCase()}…`} aria-label="Search" className={`${inputClass} w-64`} />
        <select name="status" defaultValue={status} aria-label="Status" className={`${inputClass} w-40`}>
          <option value="">Any status</option>
          {STATUSES.map((st) => <option key={st} value={st}>{STATUS_LABEL[st]}</option>)}
        </select>
        {ct.filter && (
          <select name="filter" defaultValue={filter} aria-label={ct.filter.label} className={`${inputClass} w-48`}>
            <option value="">Any {ct.filter.label.toLowerCase()}</option>
            {ct.filter.options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )}
        <Btn type="submit" variant="secondary">Filter</Btn>
        <span className="ml-auto text-xs text-ink-muted">{count} record{count === 1 ? "" : "s"}</span>
      </form>

      <form action={bulkArchive.bind(null, table)}>
        <Table head={<>
          {isAdmin && <th className={th}><span className="sr-only">Select</span></th>}
          <th className={th}>{ct.singular}</th>
          {ct.listColumns.map((c) => <th key={c.name} className={th}>{c.label}</th>)}
          <th className={th}>Status</th><th className={th}>Updated</th>
        </>}>
          {rows.length === 0 && <tr><td className={`${td} text-center text-ink-muted`} colSpan={ct.listColumns.length + 4}>No records match.</td></tr>}
          {rows.map((r) => (
            <tr key={String(r.id)} className="hover:bg-cloud/60">
              {isAdmin && <td className={td}><input type="checkbox" name="ids" value={String(r.id)} aria-label={`Select ${String(r[ct.titleField])}`} className="size-4 accent-cobalt" /></td>}
              <td className={td}>
                <Link href={`/employee/content/${table}/${r.id}`} className="font-semibold hover:text-cobalt">{String(r[ct.titleField] ?? r.slug)}</Link>
                {r.pending_status === "in_review" ? <span className="ml-2 rounded-sm bg-runway-tint px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase text-[#8a4100]">Pending changes</span> : null}
              </td>
              {ct.listColumns.map((c) => <td key={c.name} className={`${td} text-ink-muted`}>{cell(r[c.name])}</td>)}
              <td className={td}><StatusBadge status={String(r.status)} /></td>
              <td className={`${td} whitespace-nowrap text-ink-muted`}>{fmtDateTime(r.updated_at)}</td>
            </tr>
          ))}
        </Table>
        <div className="mt-3 flex items-center justify-between gap-3">
          {isAdmin ? <Btn type="submit" variant="danger" small>Archive selected</Btn> : <span />}
          {pages > 1 && (
            <nav aria-label="Pagination" className="flex items-center gap-2 text-sm">
              {page > 1 && <Link href={link(page - 1)} className="font-semibold text-cobalt hover:underline">Previous</Link>}
              <span className="text-ink-muted">Page {page} of {pages}</span>
              {page < pages && <Link href={link(page + 1)} className="font-semibold text-cobalt hover:underline">Next</Link>}
            </nav>
          )}
        </div>
      </form>
    </PortalShell>
  );
}
