import type { Metadata } from "next";
import Link from "next/link";
import { Btn, fmtDateTime, inputClass, Notice, one, PortalShell, Table, td, th, type Params } from "@/components/portal/ui";
import { listAudit } from "@/lib/portal/queries";
import { CONTENT_KEYS } from "@/lib/portal/registry";
import { requirePortal } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Audit Logs", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const ACTIONS = ["insert", "update", "delete", "publish", "unpublish", "schedule", "archive", "restore", "submit_review", "approve", "reject", "upload", "replace", "file_delete", "invite", "role_change", "user_disable", "user_enable", "user_activate", "user_delete", "sign_in", "sign_in_failed", "sign_out", "mfa_enrolled", "mfa_verified", "mfa_failed", "password_reset"];

export default async function Page({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const s = await requirePortal("admin");
  const f = { actor: one(sp, "actor"), action: one(sp, "action"), table: one(sp, "table"), from: one(sp, "from"), to: one(sp, "to"), page: Number(one(sp, "page") || 1) };
  const { rows, count, page } = await listAudit(s.client, f);
  const pages = Math.max(1, Math.ceil(count / 50));
  const link = (p: number) => `/employee/audit?${new URLSearchParams({ ...f, page: String(p) })}`;

  return (
    <PortalShell session={s} title="Audit logs" current="/employee/audit">
      <Notice params={sp} />
      <form className="mb-4 flex flex-wrap items-end gap-2">
        <input name="actor" defaultValue={f.actor} placeholder="User email" aria-label="User" className={`${inputClass} w-48`} />
        <select name="action" defaultValue={f.action} aria-label="Action" className={`${inputClass} w-44`}><option value="">Any action</option>{ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}</select>
        <select name="table" defaultValue={f.table} aria-label="Content type" className={`${inputClass} w-44`}><option value="">Any type</option>{[...CONTENT_KEYS, "media_assets", "portal_users", "site_settings"].map((t) => <option key={t} value={t}>{t}</option>)}</select>
        <input name="from" type="date" defaultValue={f.from} aria-label="From" className={`${inputClass} w-40`} />
        <input name="to" type="date" defaultValue={f.to} aria-label="To" className={`${inputClass} w-40`} />
        <Btn type="submit" variant="secondary">Filter</Btn>
        <span className="ml-auto text-xs text-ink-muted">{count} entries · read-only</span>
      </form>
      <Table head={<><th className={th}>When</th><th className={th}>Who</th><th className={th}>Action</th><th className={th}>Record</th><th className={th}>Details</th></>}>
        {rows.length === 0 && <tr><td className={`${td} text-center text-ink-muted`} colSpan={5}>No entries match.</td></tr>}
        {rows.map((r) => (
          <tr key={String(r.id)}>
            <td className={`${td} whitespace-nowrap text-ink-muted`}>{fmtDateTime(r.at)}</td>
            <td className={td}>{String(r.actor_email ?? "system")}</td>
            <td className={`${td} font-mono text-xs`}>{String(r.action)}</td>
            <td className={td}>{r.table_name ? <span className="text-ink-muted">{String(r.table_name)}{r.row_id ? ` · ${String(r.row_id).slice(0, 8)}` : ""}</span> : "—"}</td>
            <td className={`${td} max-w-md truncate`} title={String(r.summary ?? "")}>{String(r.summary ?? "")}{r.meta && typeof r.meta === "object" && "ip" in (r.meta as object) ? <span className="ml-2 text-xs text-ink-muted">ip {String((r.meta as { ip?: string }).ip)}</span> : null}</td>
          </tr>
        ))}
      </Table>
      {pages > 1 && (
        <nav aria-label="Pagination" className="mt-3 flex items-center gap-2 text-sm">
          {page > 1 && <Link href={link(page - 1)} className="font-semibold text-cobalt hover:underline">Previous</Link>}
          <span className="text-ink-muted">Page {page} of {pages}</span>
          {page < pages && <Link href={link(page + 1)} className="font-semibold text-cobalt hover:underline">Next</Link>}
        </nav>
      )}
    </PortalShell>
  );
}
