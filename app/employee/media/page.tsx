import type { Metadata } from "next";
import { Btn, Card, Empty, fmtBytes, fmtDateTime, inputClass, Label, Notice, one, PortalShell, Table, td, th, type Params } from "@/components/portal/ui";
import { deleteMedia, uploadMedia } from "@/lib/portal/actions";
import { listMedia, publicFileUrl } from "@/lib/portal/queries";
import { MEDIA_TYPES } from "@/lib/portal/registry";
import { atLeast, requirePortal } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Media Library", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const s = await requirePortal();
  const q = one(sp, "q");
  const replaceId = one(sp, "replace");
  const view = one(sp, "view") === "grid" ? "grid" : "table";
  const rows = await listMedia(s.client, q);
  const replacing = replaceId ? rows.find((r) => String(r.id) === replaceId) : null;
  const canUpload = atLeast(s.profile.role, "contributor");
  const isAdmin = atLeast(s.profile.role, "admin");

  return (
    <PortalShell session={s} title="Media library" current="/employee/media" actions={
      <div className="flex items-center gap-2">
        <nav aria-label="View" className="flex rounded-sm border border-line text-xs font-semibold">
          {(["table", "grid"] as const).map((v) => (
            <a key={v} href={`/employee/media?${new URLSearchParams({ q, view: v })}`} aria-current={view === v ? "page" : undefined} className={view === v ? "bg-navy px-3 py-2 capitalize text-white" : "px-3 py-2 capitalize text-navy hover:bg-cloud"}>{v}</a>
          ))}
        </nav>
        <form className="flex gap-2"><input type="hidden" name="view" value={view} /><input name="q" defaultValue={q} placeholder="Search files…" aria-label="Search files" className={`${inputClass} w-56`} /><Btn type="submit" variant="secondary">Search</Btn></form>
      </div>
    }>
      <Notice params={sp} />
      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <div>
          {rows.length > 0 && view === "grid" && (
            <ul className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
              {rows.map((r) => {
                const url = publicFileUrl(s.client, String(r.bucket), String(r.path));
                const isImage = String(r.mime_type).startsWith("image/");
                return (
                  <li key={String(r.id)} className="overflow-hidden rounded-lg border border-line bg-white">
                    <div className="grid aspect-video place-items-center bg-cloud text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {isImage && url ? <img src={url} alt={String(r.alt_text ?? "")} className="h-full w-full object-cover" /> : MEDIA_TYPES[String(r.mime_type)]?.toUpperCase() ?? "FILE"}
                    </div>
                    <div className="p-4 text-sm">
                      <p className="truncate font-semibold">{String(r.title)}</p>
                      <p className="mt-0.5 truncate text-xs text-ink-muted">{String(r.visibility)} · {fmtBytes(Number(r.size_bytes))} · {fmtDateTime(r.created_at)}</p>
                      <div className="mt-3 flex gap-4 text-xs font-semibold">
                        {url && <a href={url} target="_blank" rel="noopener" className="text-cobalt hover:underline">Open</a>}
                        {canUpload && <a href={`/employee/media?replace=${r.id}&view=grid`} className="text-cobalt hover:underline">Replace</a>}
                        {isAdmin && <form action={deleteMedia}><input type="hidden" name="id" value={String(r.id)} /><button type="submit" className="text-[#8a1c1c] hover:underline">Delete</button></form>}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {rows.length === 0 ? <Empty>No files yet.</Empty> : view === "grid" ? null : (
            <Table head={<><th className={th}>File</th><th className={th}>Type</th><th className={th}>Visibility</th><th className={th}>Size</th><th className={th}>Uploaded</th><th className={th}><span className="sr-only">Actions</span></th></>}>
              {rows.map((r) => {
                const url = publicFileUrl(s.client, String(r.bucket), String(r.path));
                return (
                  <tr key={String(r.id)}>
                    <td className={td}>
                      <p className="font-semibold">{String(r.title)}</p>
                      <p className="text-xs text-ink-muted">{String(r.file_name)}{r.alt_text ? ` · alt: ${String(r.alt_text)}` : ""}{r.previous_asset_id ? " · replacement" : ""}</p>
                      {url && <a href={url} target="_blank" rel="noopener" className="break-all text-xs text-cobalt hover:underline">{url}</a>}
                    </td>
                    <td className={`${td} text-ink-muted`}>{MEDIA_TYPES[String(r.mime_type)]?.toUpperCase() ?? String(r.mime_type)}</td>
                    <td className={`${td} text-ink-muted`}>{String(r.visibility)}</td>
                    <td className={`${td} whitespace-nowrap text-ink-muted`}>{fmtBytes(Number(r.size_bytes))}</td>
                    <td className={`${td} whitespace-nowrap text-ink-muted`}>{fmtDateTime(r.created_at)}</td>
                    <td className={`${td} whitespace-nowrap`}>
                      {canUpload && <a href={`/employee/media?replace=${r.id}`} className="text-xs font-semibold text-cobalt hover:underline">Replace</a>}
                      {isAdmin && <form action={deleteMedia} className="mt-1"><input type="hidden" name="id" value={String(r.id)} /><button type="submit" className="text-xs font-semibold text-[#8a1c1c] hover:underline">Delete</button></form>}
                    </td>
                  </tr>
                );
              })}
            </Table>
          )}
        </div>
        {canUpload && (
          <Card title={replacing ? `Replace “${String(replacing.title)}”` : "Upload a file"}>
            <form action={uploadMedia} className="space-y-4" encType="multipart/form-data">
              {replacing && <input type="hidden" name="replace_id" value={String(replacing.id)} />}
              <div className="rounded-md border border-runway/50 bg-runway-tint p-3 text-xs text-[#8a4100]">
                Do not upload classified, CUI, export-controlled or otherwise sensitive information. This system is not approved for that data.
              </div>
              <div><Label htmlFor="file" help="JPG, PNG, WebP, PDF, DOCX, XLSX, CSV, MP4 · 50 MB max">File</Label><input id="file" name="file" type="file" required accept={Object.keys(MEDIA_TYPES).join(",")} className="mt-1 block w-full text-sm" /></div>
              <div><Label htmlFor="title">Display title</Label><input id="title" name="title" defaultValue={replacing ? String(replacing.title) : ""} className={`${inputClass} mt-1`} /></div>
              <div><Label htmlFor="description">Description</Label><textarea id="description" name="description" rows={2} defaultValue={replacing ? String(replacing.description ?? "") : ""} className={`${inputClass} mt-1`} /></div>
              <div><Label htmlFor="alt_text" help="Required for images">Alt text</Label><input id="alt_text" name="alt_text" defaultValue={replacing ? String(replacing.alt_text ?? "") : ""} className={`${inputClass} mt-1`} /></div>
              <div><Label htmlFor="category">Category</Label><input id="category" name="category" defaultValue={replacing ? String(replacing.category ?? "") : ""} className={`${inputClass} mt-1`} placeholder="e.g. Hero images, Guides" /></div>
              <div>
                <Label htmlFor="visibility">Visibility</Label>
                <select id="visibility" name="visibility" defaultValue={replacing ? String(replacing.visibility) : "public"} className={`${inputClass} mt-1`}>
                  <option value="public">Public — served on the website</option>
                  <option value="employee">Employee-only — private bucket</option>
                  <option value="hidden">Hidden — private, not listed</option>
                </select>
              </div>
              <label className="flex items-start gap-2 text-xs text-navy"><input type="checkbox" name="attest" required className="mt-0.5 size-4 accent-cobalt" />I confirm this file contains no classified, CUI, export-controlled or sensitive material.</label>
              <Btn type="submit" className="w-full">{replacing ? "Upload replacement" : "Upload"}</Btn>
              {replacing && <p className="text-center text-xs"><a href="/employee/media" className="font-semibold text-cobalt hover:underline">Cancel replacement</a></p>}
            </form>
          </Card>
        )}
      </div>
    </PortalShell>
  );
}
