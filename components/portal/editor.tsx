import Link from "next/link";
import { approvePending, changeStatus, rejectPending, restoreRevision, saveRecord } from "@/lib/portal/actions";
import type { Row } from "@/lib/portal/queries";
import { COMMON_FIELDS, STATUS_LABEL, type ContentType, type Status } from "@/lib/portal/registry";
import { atLeast, type PortalProfile } from "@/lib/portal/roles";
import { Btn, Card, FieldInput, fmtDateTime, inputClass, Label, StatusBadge } from "./ui";

type Revision = { id: number; version: number; status: string | null; note: string | null; changed_by: string | null; changed_at: string };

/**
 * Structured editor (brief §7.5, §12): fields on the left, status / workflow / versions on the right.
 * Workflow buttons are separate forms because HTML forms cannot nest.
 */
export function Editor({ ct, table, row, revisions, profile, names }: { ct: ContentType; table: string; row: Row | null; revisions: Revision[]; profile: PortalProfile; names: Record<string, string> }) {
  const id = row ? String(row.id) : null;
  const status = (row?.status as Status | undefined) ?? "draft";
  const isLive = status === "published" || status === "scheduled";
  const isAdmin = atLeast(profile.role, "admin");
  const isEditor = atLeast(profile.role, "editor");
  const pending = (row?.pending as Record<string, unknown> | null) ?? null;
  const pendingStatus = row?.pending_status as string | null | undefined;
  // Editors see the proposed values when changes are pending so they can keep iterating.
  const values: Row = pending && !isAdmin ? { ...row, ...pending } : (row ?? {});
  const publicFields = ct.fields.filter((f) => !f.restricted);
  const restrictedFields = ct.fields.filter((f) => f.restricted);
  const who = (uid: unknown) => (typeof uid === "string" ? names[uid] ?? "—" : "—");
  const livePath = row && isLive ? ct.publicPath?.(row) ?? null : null;
  const canEdit = atLeast(profile.role, "contributor");

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
      <form action={saveRecord.bind(null, table, id)} className="space-y-6">
        {pending && isAdmin && (
          <div className="rounded-md border border-runway/50 bg-runway-tint p-4 text-sm">
            <p className="font-semibold text-[#8a4100]">Pending changes awaiting your approval</p>
            <p className="mt-1 text-navy/80">Proposed by {who(row?.pending_by)} on {fmtDateTime(row?.pending_at)}. The fields below show the live values; the proposed values are listed here.</p>
            <dl className="mt-3 grid gap-1 text-xs">
              {Object.entries(pending).map(([k, v]) => (
                <div key={k} className="grid grid-cols-[10rem_1fr] gap-2"><dt className="font-mono text-ink-muted">{k}</dt><dd className="break-words font-medium">{Array.isArray(v) || (v && typeof v === "object") ? JSON.stringify(v) : String(v ?? "—")}</dd></div>
              ))}
            </dl>
          </div>
        )}
        {pending && !isAdmin && (
          <div className="rounded-md border border-runway/50 bg-runway-tint p-4 text-sm">
            <p className="font-semibold text-[#8a4100]">Pending changes submitted for admin approval</p>
            <p className="mt-1 text-navy/80">Saving again replaces the pending set. The live page keeps the approved values until an admin approves.</p>
          </div>
        )}
        {pendingStatus === "rejected" && !pending && (
          <div className="rounded-md border border-[#f3b4b4] bg-[#fff2f2] p-4 text-sm text-[#8a1c1c]">The last pending changes were rejected{row?.note ? ` — ${String(row.note)}` : ""}.</div>
        )}
        {isLive && !isAdmin && (
          <p className="text-sm text-ink-muted">This record is live. Your edits are saved as pending changes for an admin to approve; the public page is unchanged until then.</p>
        )}

        <Card title={`${ct.singular} fields`}>
          <div className="grid gap-5 md:grid-cols-2">
            {publicFields.map((f) => <FieldInput key={f.name} field={f} value={values[f.name]} readOnly={!canEdit} />)}
          </div>
        </Card>
        {restrictedFields.length > 0 && (
          <Card title="Government-only details (never published)">
            <div className="grid gap-5 md:grid-cols-2">
              {restrictedFields.map((f) => <FieldInput key={f.name} field={f} value={values[f.name]} readOnly={!canEdit} />)}
            </div>
          </Card>
        )}
        <Card title="Scheduling, ordering and SEO">
          <div className="grid gap-5 md:grid-cols-2">
            {COMMON_FIELDS.map((f) => <FieldInput key={f.name} field={f} value={values[f.name]} readOnly={!canEdit} />)}
          </div>
        </Card>
        <Card title="Version note">
          <Label htmlFor="note" help="What changed and why — stored with this version.">Note</Label>
          <input id="note" name="note" className={`${inputClass} mt-1`} placeholder="e.g. Updated eligibility text per program office" disabled={!canEdit} />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Btn type="submit" disabled={!canEdit}>{id ? (isLive && !isAdmin ? "Save as pending changes" : "Save") : "Create draft"}</Btn>
            {id && <Link href={`/employee/preview/${table}/${id}${pending ? "?pending=1" : ""}`} className="text-sm font-semibold text-cobalt hover:underline" target="_blank" rel="noopener">Preview draft</Link>}
            {livePath && <a href={livePath} target="_blank" rel="noopener" className="text-sm font-semibold text-cobalt hover:underline">View live page</a>}
          </div>
        </Card>
      </form>

      <aside className="space-y-6">
        <Card title="Status">
          <div className="flex items-center justify-between"><StatusBadge status={status} /><span className="text-xs text-ink-muted">Version {String(row?.version ?? 1)}</span></div>
          {id && (
            <div className="mt-5 space-y-2">
              {status !== "in_review" && status !== "published" && status !== "scheduled" && isEditor && (
                <form action={changeStatus.bind(null, table, id)}><input type="hidden" name="status" value="in_review" /><Btn type="submit" variant="secondary" className="w-full">Submit for review</Btn></form>
              )}
              {isAdmin && status !== "published" && (
                <form action={changeStatus.bind(null, table, id)}><input type="hidden" name="status" value="published" /><Btn type="submit" className="w-full">Publish now</Btn></form>
              )}
              {isAdmin && status !== "scheduled" && (
                <form action={changeStatus.bind(null, table, id)} className="space-y-2 rounded-md border border-line p-3">
                  <input type="hidden" name="status" value="scheduled" />
                  <Label htmlFor="schedule_at">Schedule publication</Label>
                  <input id="schedule_at" name="publish_at" type="datetime-local" required className={inputClass} />
                  <Btn type="submit" variant="secondary" className="w-full">Schedule</Btn>
                </form>
              )}
              {isAdmin && status !== "archived" && (
                <form action={changeStatus.bind(null, table, id)}><input type="hidden" name="status" value="archived" /><Btn type="submit" variant="danger" className="w-full">Archive</Btn></form>
              )}
              {(status === "in_review" && isEditor) || (status !== "draft" && isAdmin) ? (
                <form action={changeStatus.bind(null, table, id)}><input type="hidden" name="status" value="draft" /><Btn type="submit" variant="ghost" className="w-full">{isLive ? "Unpublish to draft" : "Back to draft"}</Btn></form>
              ) : null}
            </div>
          )}
          {pending && isAdmin && id && (
            <div className="mt-5 space-y-2 border-t border-line pt-4">
              <form action={approvePending.bind(null, table, id)}><Btn type="submit" variant="accent" className="w-full">Approve pending changes</Btn></form>
              <form action={rejectPending.bind(null, table, id)} className="space-y-2">
                <input name="reason" placeholder="Reason (optional)" className={inputClass} />
                <Btn type="submit" variant="danger" className="w-full">Reject</Btn>
              </form>
            </div>
          )}
          <dl className="mt-5 space-y-1.5 border-t border-line pt-4 text-xs text-ink-muted">
            <div className="flex justify-between gap-2"><dt>Author</dt><dd className="text-navy">{who(row?.created_by)}</dd></div>
            <div className="flex justify-between gap-2"><dt>Last edited</dt><dd className="text-navy">{who(row?.updated_by)} · {fmtDateTime(row?.updated_at)}</dd></div>
            <div className="flex justify-between gap-2"><dt>Reviewer</dt><dd className="text-navy">{who(row?.approved_by)}</dd></div>
            <div className="flex justify-between gap-2"><dt>Published</dt><dd className="text-navy">{fmtDateTime(row?.published_at)}</dd></div>
            {row?.publish_at ? <div className="flex justify-between gap-2"><dt>Scheduled for</dt><dd className="text-navy">{fmtDateTime(row.publish_at)}</dd></div> : null}
          </dl>
        </Card>

        {id && (
          <Card title="Versions">
            {revisions.length === 0 ? <p className="text-sm text-ink-muted">No earlier versions yet.</p> : (
              <ol className="space-y-3 text-sm">
                {revisions.map((r) => (
                  <li key={r.id} className="flex items-start justify-between gap-3 border-b border-line pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-semibold">v{r.version} <span className="font-normal text-ink-muted">· {STATUS_LABEL[r.status as Status] ?? r.status ?? "—"}</span></p>
                      <p className="text-xs text-ink-muted">{who(r.changed_by)} · {fmtDateTime(r.changed_at)}</p>
                      {r.note && <p className="mt-0.5 text-xs text-navy/80">{r.note}</p>}
                    </div>
                    {isEditor && (
                      <form action={restoreRevision.bind(null, table, id)}><input type="hidden" name="revision_id" value={r.id} /><Btn type="submit" variant="ghost" small>Restore</Btn></form>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </Card>
        )}
      </aside>
    </div>
  );
}
