import type { Metadata } from "next";
import Link from "next/link";
import { Btn, BtnLink, Card, Empty, fmtDate, fmtDateTime, inputClass, Notice, one, PortalShell, StatusBadge, type Params } from "@/components/portal/ui";
import { dashboardData, searchAll, type Row } from "@/lib/portal/queries";
import { CONTENT_TYPES } from "@/lib/portal/registry";
import { atLeast, requirePortal } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const QUICK = [
  { label: "New opportunity", href: "/employee/content/opportunities/new" }, { label: "New event", href: "/employee/content/events/new" },
  { label: "Upload resource", href: "/employee/media" }, { label: "Add FAQ", href: "/employee/content/faqs/new" },
  { label: "Add tool", href: "/employee/content/ai_tools/new" }, { label: "Update metric", href: "/employee/content/metrics" },
];

function RowList({ rows, names, empty, when }: { rows: Row[]; names: Record<string, string>; empty: string; when?: "publish_at" | "updated_at" }) {
  if (!rows.length) return <Empty>{empty}</Empty>;
  return (
    <ul className="divide-y divide-line text-sm">
      {rows.map((r) => (
        <li key={`${r.table_name}-${r.id}`} className="flex items-center justify-between gap-3 py-2">
          <div className="min-w-0">
            <Link href={`/employee/content/${r.table_name}/${r.id}`} className="block truncate font-semibold hover:text-cobalt">{String(r.title)}</Link>
            <p className="truncate text-xs text-ink-muted">{CONTENT_TYPES[String(r.table_name)]?.singular ?? r.table_name} · {names[String(r.updated_by)] ?? "—"} · {fmtDateTime(when === "publish_at" ? r.publish_at : r.updated_at)}</p>
          </div>
          <StatusBadge status={String(r.status)} />
        </li>
      ))}
    </ul>
  );
}

export default async function Page({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const s = await requirePortal();
  const q = one(params, "q");
  const [d, results] = await Promise.all([dashboardData(s.client), searchAll(s.client, q)]);
  const approvals = [...d.review, ...d.pending.filter((p) => !d.review.some((r) => r.id === p.id))];

  return (
    <PortalShell session={s} title="Dashboard" current="/employee/dashboard" actions={
      <form className="flex gap-2"><input name="q" defaultValue={q} placeholder="Search all content…" aria-label="Search all content" className={`${inputClass} w-64`} /><Btn type="submit" variant="secondary">Search</Btn></form>
    }>
      <Notice params={params} />
      <p className="text-sm text-ink-muted">Welcome back, {s.profile.display_name || s.profile.email}. Role: <strong className="text-navy">{s.profile.role.replace("_", " ")}</strong>.</p>

      {q && (
        <Card title={`Search results for “${q}”`} className="mt-6">
          <RowList rows={results} names={d.names} empty="Nothing matched." />
        </Card>
      )}

      {atLeast(s.profile.role, "contributor") && (
        <div className="mt-6 flex flex-wrap gap-2">
          {QUICK.map((a) => <BtnLink key={a.href} href={a.href} variant="secondary" small>{a.label}</BtnLink>)}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
        <Card title="Pending approvals"><RowList rows={approvals} names={d.names} empty="Nothing is waiting for review." /></Card>
        <Card title="Recent drafts"><RowList rows={d.drafts} names={d.names} empty="No drafts in progress." /></Card>
        <Card title="Scheduled updates"><RowList rows={d.scheduled} names={d.names} empty="Nothing scheduled." when="publish_at" /></Card>
        <Card title="Recently published"><RowList rows={d.published} names={d.names} empty="Nothing published yet." /></Card>
        <Card title="Upcoming opportunity deadlines">
          {d.opps.length ? (
            <ul className="divide-y divide-line text-sm">{d.opps.map((o) => <li key={String(o.id)} className="flex justify-between gap-3 py-2"><Link href={`/employee/content/opportunities/${o.id}`} className="truncate font-semibold hover:text-cobalt">{String(o.title)}</Link><span className="shrink-0 text-ink-muted">{fmtDate(o.closes_at)}</span></li>)}</ul>
          ) : <Empty>No upcoming deadlines.</Empty>}
        </Card>
        <Card title="Events this month">
          {d.events.length ? (
            <ul className="divide-y divide-line text-sm">{d.events.map((e) => <li key={String(e.id)} className="flex justify-between gap-3 py-2"><Link href={`/employee/content/events/${e.id}`} className="truncate font-semibold hover:text-cobalt">{String(e.title)}</Link><span className="shrink-0 text-ink-muted">{fmtDate(e.starts_at)}</span></li>)}</ul>
          ) : <Empty>No events scheduled this month.</Empty>}
        </Card>
        <Card title="Content needing review"><RowList rows={d.stale} names={d.names} empty="Everything published was updated in the last 90 days." /></Card>
        <Card title="Most edited"><RowList rows={d.topEdited} names={d.names} empty="No edits yet." /></Card>
        <Card title="Recently archived"><RowList rows={d.archived} names={d.names} empty="Nothing archived yet." /></Card>
        <Card title="Recent uploads" actions={<Link href="/employee/media" className="text-xs font-semibold text-cobalt hover:underline">Media library</Link>}>
          {d.uploads.length ? (
            <ul className="divide-y divide-line text-sm">{d.uploads.map((u) => <li key={String(u.id)} className="flex justify-between gap-3 py-2"><span className="truncate font-semibold">{String(u.title)}</span><span className="shrink-0 text-ink-muted">{fmtDate(u.created_at)}</span></li>)}</ul>
          ) : <Empty>No files uploaded yet.</Empty>}
        </Card>
      </div>
    </PortalShell>
  );
}
