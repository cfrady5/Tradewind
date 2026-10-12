import type { SupabaseClient } from "@supabase/supabase-js";
import type { ContentType } from "./registry";

export type Row = Record<string, unknown>;
export const PAGE_SIZE = 25;

export type ListParams = { q?: string; status?: string; filter?: string; page?: number };

/** Paginated, filtered list for a content type (RLS already limits this to portal users). */
export async function listContent(client: SupabaseClient, ct: ContentType, p: ListParams) {
  let query = client.from(ct.table).select("*", { count: "exact" });
  if (p.status) query = query.eq("status", p.status);
  if (p.filter && ct.filter) query = query.eq(ct.filter.name, p.filter);
  if (p.q) {
    const cols = [ct.titleField, "slug"].filter((c, i, a) => a.indexOf(c) === i);
    query = query.or(cols.map((c) => `${c}.ilike.%${p.q!.replace(/[%,()]/g, " ")}%`).join(","));
  }
  const sort = ct.defaultSort ?? { column: "updated_at", ascending: false };
  const page = Math.max(1, p.page ?? 1);
  const { data, count, error } = await query.order(sort.column, { ascending: sort.ascending ?? true, nullsFirst: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  return { rows: (data ?? []) as Row[], count: count ?? 0, page, error: error?.message ?? null };
}

export async function getRecord(client: SupabaseClient, ct: ContentType, id: string) {
  const { data } = await client.from(ct.table).select("*").eq("id", id).maybeSingle();
  return (data as Row | null) ?? null;
}

export async function getRevisions(client: SupabaseClient, ct: ContentType, id: string) {
  const { data } = await client.from("content_revisions").select("id, version, status, note, changed_by, changed_at").eq("table_name", ct.table).eq("row_id", id).order("version", { ascending: false }).limit(50);
  return (data ?? []) as { id: number; version: number; status: string | null; note: string | null; changed_by: string | null; changed_at: string }[];
}

export async function dashboardData(client: SupabaseClient) {
  const now = new Date();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
  const [review, pending, drafts, scheduled, published, opps, events, uploads, users] = await Promise.all([
    client.from("portal_content").select("*").eq("status", "in_review").order("updated_at", { ascending: false }).limit(10),
    client.from("portal_content").select("*").eq("pending_status", "in_review").order("updated_at", { ascending: false }).limit(10),
    client.from("portal_content").select("*").eq("status", "draft").order("updated_at", { ascending: false }).limit(8),
    client.from("portal_content").select("*").eq("status", "scheduled").order("publish_at", { ascending: true }).limit(8),
    client.from("portal_content").select("*").eq("status", "published").order("updated_at", { ascending: false }).limit(8),
    client.from("opportunities").select("id, title, closes_at, status").gte("closes_at", now.toISOString()).order("closes_at", { ascending: true }).limit(6),
    client.from("events").select("id, title, starts_at, status").gte("starts_at", now.toISOString()).lt("starts_at", monthEnd).order("starts_at", { ascending: true }).limit(6),
    client.from("media_assets").select("id, title, file_name, mime_type, created_at, bucket, path").is("deleted_at", null).order("created_at", { ascending: false }).limit(6),
    client.from("portal_users").select("user_id, email, display_name").limit(200),
  ]);
  const names = Object.fromEntries((users.data ?? []).map((u) => [u.user_id, u.display_name || u.email]));
  return {
    review: (review.data ?? []) as Row[], pending: (pending.data ?? []) as Row[], drafts: (drafts.data ?? []) as Row[],
    scheduled: (scheduled.data ?? []) as Row[], published: (published.data ?? []) as Row[],
    opps: (opps.data ?? []) as Row[], events: (events.data ?? []) as Row[], uploads: (uploads.data ?? []) as Row[], names,
  };
}

export async function searchAll(client: SupabaseClient, q: string) {
  if (!q) return [] as Row[];
  const { data } = await client.from("portal_content").select("*").or(`title.ilike.%${q.replace(/[%,()]/g, " ")}%,slug.ilike.%${q.replace(/[%,()]/g, " ")}%`).limit(30);
  return (data ?? []) as Row[];
}

export async function listUsers(client: SupabaseClient) {
  const { data } = await client.from("portal_users").select("*").order("created_at", { ascending: true });
  return (data ?? []) as Row[];
}

export async function listMedia(client: SupabaseClient, q?: string) {
  let query = client.from("media_assets").select("*").is("deleted_at", null).order("created_at", { ascending: false }).limit(200);
  if (q) query = query.or(`title.ilike.%${q}%,file_name.ilike.%${q}%,category.ilike.%${q}%`);
  const { data } = await query;
  return (data ?? []) as Row[];
}

export async function listAudit(client: SupabaseClient, f: { actor?: string; action?: string; table?: string; from?: string; to?: string; page?: number }) {
  let query = client.from("audit_log").select("*", { count: "exact" }).order("at", { ascending: false });
  if (f.actor) query = query.ilike("actor_email", `%${f.actor}%`);
  if (f.action) query = query.eq("action", f.action);
  if (f.table) query = query.eq("table_name", f.table);
  if (f.from) query = query.gte("at", f.from);
  if (f.to) query = query.lte("at", `${f.to}T23:59:59Z`);
  const page = Math.max(1, f.page ?? 1);
  const { data, count } = await query.range((page - 1) * 50, page * 50 - 1);
  return { rows: (data ?? []) as Row[], count: count ?? 0, page };
}

export async function getSettings(client: SupabaseClient) {
  const { data } = await client.from("site_settings").select("key, value");
  return Object.fromEntries((data ?? []).map((r) => [r.key as string, r.value as unknown]));
}

export function publicFileUrl(client: SupabaseClient, bucket: string, path: string) {
  return bucket === "public-media" ? client.storage.from(bucket).getPublicUrl(path).data.publicUrl : null;
}
