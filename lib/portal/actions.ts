"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { adminClient } from "@/lib/supabase/admin";
import { atLeast, createPortalClient, getPortalSession, requirePortal, roleRank, ROLES, type PortalRole } from "@/lib/supabase/server";
import { SITE } from "@/lib/site-config";
import { COMMON_FIELDS, getType, MEDIA_MAX_BYTES, MEDIA_TYPES, parseFields, SETTING_KEYS, STATUSES, type Status } from "./registry";

/* ------------------------------------------------------------------ helpers */
const q = (path: string, params: Record<string, string>) => `${path}?${new URLSearchParams(params).toString()}`;
const str = (f: FormData, k: string) => { const v = f.get(k); return typeof v === "string" ? v.trim() : ""; };
const LIVE: Status[] = ["published", "scheduled"];

/** Login throttle (brief §14): 5 attempts per identity+IP per 15 minutes, in addition to Supabase Auth's own limits. */
const attempts = new Map<string, { n: number; until: number }>();
function throttle(key: string): boolean {
  const now = Date.now();
  const cur = attempts.get(key);
  if (cur && cur.until > now && cur.n >= 5) return true;
  if (!cur || cur.until <= now) attempts.set(key, { n: 1, until: now + 15 * 60_000 });
  else cur.n += 1;
  return false;
}
async function clientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}
const siteUrl = () => SITE.url.replace(/\/$/, "");

/* ------------------------------------------------------------------ auth */
export async function signIn(formData: FormData) {
  const email = str(formData, "email").toLowerCase();
  const password = str(formData, "password");
  if (!email || !password) redirect(q("/employee", { error: "Enter your email and password." }));
  const ip = await clientIp();
  if (throttle(`${email}|${ip}`)) redirect(q("/employee", { error: "Too many attempts. Try again in 15 minutes." }));

  const client = await createPortalClient();
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    const admin = adminClient();
    if (admin) await admin.from("audit_log").insert({ action: "sign_in_failed", actor_email: email, summary: error.message, meta: { ip } });
    redirect(q("/employee", { error: "Invalid email or password." }));
  }
  await client.rpc("log_portal_event", { p_action: "sign_in", p_summary: "Password accepted", p_meta: { ip } });
  redirect("/employee/mfa");
}

export async function signOut() {
  const client = await createPortalClient();
  const { data: { user } } = await client.auth.getUser();
  if (user) await client.rpc("log_portal_event", { p_action: "sign_out" });
  await client.auth.signOut();
  redirect("/employee?signedout=1");
}

export async function requestPasswordReset(formData: FormData) {
  const email = str(formData, "email").toLowerCase();
  const ip = await clientIp();
  if (email && !throttle(`reset|${email}|${ip}`)) {
    const client = await createPortalClient();
    await client.auth.resetPasswordForEmail(email, { redirectTo: `${siteUrl()}/employee/auth/callback?next=/employee/set-password` });
    const admin = adminClient();
    if (admin) await admin.from("audit_log").insert({ action: "password_reset", actor_email: email, summary: "Reset email requested", meta: { ip } });
  }
  // Same response whether or not the address exists.
  redirect(q("/employee", { notice: "If that address belongs to an employee account, a reset link is on its way." }));
}

export async function setPassword(formData: FormData) {
  const password = str(formData, "password");
  const confirm = str(formData, "confirm");
  if (password.length < 12) redirect(q("/employee/set-password", { error: "Use at least 12 characters." }));
  if (password !== confirm) redirect(q("/employee/set-password", { error: "The two passwords do not match." }));
  const client = await createPortalClient();
  const { error } = await client.auth.updateUser({ password });
  if (error) redirect(q("/employee/set-password", { error: error.message }));
  redirect("/employee/mfa");
}

/** Starts TOTP enrollment and returns what the authenticator app needs. Called from the enrollment component. */
export async function startEnrollment(): Promise<{ factorId: string; qr: string; secret: string } | { error: string }> {
  const s = await getPortalSession();
  if (!s) return { error: "Sign in first." };
  const { data: factors } = await s.client.auth.mfa.listFactors();
  for (const f of factors?.all ?? []) if (f.status !== "verified") await s.client.auth.mfa.unenroll({ factorId: f.id });
  const { data, error } = await s.client.auth.mfa.enroll({ factorType: "totp", friendlyName: "Tradewinds Employee Portal" });
  if (error || !data) return { error: error?.message ?? "Could not start enrollment." };
  return { factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret };
}

export async function verifyMfa(formData: FormData) {
  const factorId = str(formData, "factorId");
  const code = str(formData, "code").replace(/\s+/g, "");
  const enrolling = str(formData, "enrolling") === "1";
  const client = await createPortalClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect("/employee");
  const ip = await clientIp();
  if (throttle(`mfa|${user.id}|${ip}`)) redirect(q("/employee/mfa", { error: "Too many attempts. Try again in 15 minutes." }));
  const { error } = await client.auth.mfa.challengeAndVerify({ factorId, code });
  if (error) {
    await client.rpc("log_portal_event", { p_action: "mfa_failed", p_summary: error.message, p_meta: { ip } });
    redirect(q("/employee/mfa", { error: "That code was not accepted. Codes change every 30 seconds — try the current one." }));
  }
  if (enrolling) await client.rpc("log_portal_event", { p_action: "mfa_enrolled", p_summary: "Authenticator app enrolled" });
  await client.rpc("log_portal_event", { p_action: "mfa_verified", p_meta: { ip } });
  await client.rpc("portal_touch_sign_in");
  redirect("/employee/dashboard");
}

/* ------------------------------------------------------------------ content */
function editorPath(table: string, id: string) { return `/employee/content/${table}/${id}`; }

export async function saveRecord(table: string, id: string | null, formData: FormData) {
  const ct = getType(table);
  if (!ct) redirect("/employee/dashboard");
  const s = await requirePortal("contributor");
  const { row, errors } = parseFields([...ct.fields, ...COMMON_FIELDS], formData);
  const note = str(formData, "note") || null;
  const backTo = id ? editorPath(table, id) : `/employee/content/${table}/new`;
  if (errors.length) redirect(q(backTo, { error: errors.join(" ") }));

  if (!id) {
    const { data, error } = await s.client.from(ct.table).insert({ ...row, status: "draft", note }).select("id").single();
    if (error) redirect(q(backTo, { error: error.message }));
    redirect(q(editorPath(table, data.id), { saved: "1" }));
  }

  const { data: current, error: readError } = await s.client.from(ct.table).select("status").eq("id", id).single();
  if (readError || !current) redirect(q(backTo, { error: "Record not found." }));
  const isLive = LIVE.includes(current.status as Status);
  if (isLive && !atLeast(s.profile.role, "admin")) {
    // Editors propose; admins approve. The trigger rejects any other change to live rows.
    const { error } = await s.client.from(ct.table).update({ pending: row, pending_status: "in_review", pending_by: null, pending_at: null, note }).eq("id", id);
    if (error) redirect(q(backTo, { error: error.message }));
    redirect(q(backTo, { pending: "1" }));
  }
  const { error } = await s.client.from(ct.table).update({ ...row, note }).eq("id", id);
  if (error) redirect(q(backTo, { error: error.message }));
  if (isLive) { revalidatePath("/", "layout"); const p = ct.publicPath?.({ ...row }); if (p) revalidatePath(p.split("#")[0]); }
  redirect(q(backTo, { saved: "1" }));
}

export async function changeStatus(table: string, id: string, formData: FormData) {
  const ct = getType(table);
  if (!ct) redirect("/employee/dashboard");
  const s = await requirePortal("contributor");
  const status = str(formData, "status") as Status;
  if (!STATUSES.includes(status)) redirect(q(editorPath(table, id), { error: "Unknown status." }));
  const patch: Record<string, unknown> = { status, note: str(formData, "note") || null };
  if (status === "scheduled") {
    const at = str(formData, "publish_at");
    patch.publish_at = at ? new Date(at).toISOString() : null;
  }
  const { error } = await s.client.from(ct.table).update(patch).eq("id", id);
  if (error) redirect(q(editorPath(table, id), { error: error.message }));
  revalidatePath("/", "layout");
  redirect(q(editorPath(table, id), { status: status }));
}

export async function approvePending(table: string, id: string) {
  const ct = getType(table);
  if (!ct) redirect("/employee/dashboard");
  const s = await requirePortal("admin");
  const { data } = await s.client.from(ct.table).select("pending").eq("id", id).single();
  const pending = (data?.pending ?? null) as Record<string, unknown> | null;
  if (!pending) redirect(q(editorPath(table, id), { error: "Nothing is pending." }));
  const { error } = await s.client.from(ct.table).update({ ...pending, pending: null, pending_by: null, pending_at: null, pending_status: null, note: "Approved pending changes" }).eq("id", id);
  if (error) redirect(q(editorPath(table, id), { error: error.message }));
  revalidatePath("/", "layout");
  redirect(q(editorPath(table, id), { approved: "1" }));
}

export async function rejectPending(table: string, id: string, formData: FormData) {
  const ct = getType(table);
  if (!ct) redirect("/employee/dashboard");
  const s = await requirePortal("admin");
  const { error } = await s.client.from(ct.table).update({ pending: null, pending_by: null, pending_at: null, pending_status: "rejected", note: `Rejected: ${str(formData, "reason") || "no reason given"}` }).eq("id", id);
  if (error) redirect(q(editorPath(table, id), { error: error.message }));
  redirect(q(editorPath(table, id), { rejected: "1" }));
}

export async function restoreRevision(table: string, id: string, formData: FormData) {
  const s = await requirePortal("editor");
  const revisionId = Number(str(formData, "revision_id"));
  const { error } = await s.client.rpc("restore_revision", { p_revision_id: revisionId });
  if (error) redirect(q(editorPath(table, id), { error: error.message }));
  revalidatePath("/", "layout");
  redirect(q(editorPath(table, id), { restored: "1" }));
}

export async function bulkArchive(table: string, formData: FormData) {
  const ct = getType(table);
  if (!ct) redirect("/employee/dashboard");
  const s = await requirePortal("admin");
  const ids = formData.getAll("ids").filter((v): v is string => typeof v === "string");
  if (ids.length) {
    const { error } = await s.client.from(ct.table).update({ status: "archived", note: "Bulk archive" }).in("id", ids);
    if (error) redirect(q(`/employee/content/${table}`, { error: error.message }));
    revalidatePath("/", "layout");
  }
  redirect(q(`/employee/content/${table}`, { archived: String(ids.length) }));
}

/* ------------------------------------------------------------------ users (admin only, invite-only) */
export async function inviteUser(formData: FormData) {
  const s = await requirePortal("admin");
  const email = str(formData, "email").toLowerCase();
  const display_name = str(formData, "display_name") || null;
  const role = str(formData, "role") as PortalRole;
  if (!email || !ROLES.includes(role)) redirect(q("/employee/users", { error: "Email and role are required." }));
  if (roleRank(role) >= roleRank("admin") && s.profile.role !== "super_admin") redirect(q("/employee/users", { error: "Only a super admin can create admin accounts." }));
  const admin = adminClient();
  if (!admin) redirect(q("/employee/users", { error: "Invites need SUPABASE_SERVICE_ROLE_KEY on the server." }));

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl()}/employee/auth/callback?next=/employee/set-password`,
    data: { display_name },
  });
  if (error || !data.user) redirect(q("/employee/users", { error: error?.message ?? "Invite failed." }));

  const { error: rowError } = await s.client.from("portal_users").insert({ user_id: data.user.id, email, display_name, role, status: "invited", invited_by: s.user.id });
  if (rowError) {
    await admin.auth.admin.deleteUser(data.user.id); // roll back the auth user so the invite is not half-applied
    redirect(q("/employee/users", { error: rowError.message }));
  }
  redirect(q("/employee/users", { invited: email }));
}

export async function updateUser(formData: FormData) {
  const s = await requirePortal("admin");
  const user_id = str(formData, "user_id");
  const role = str(formData, "role") as PortalRole;
  const status = str(formData, "status");
  const display_name = str(formData, "display_name") || null;
  if (!user_id || !ROLES.includes(role) || !["invited", "active", "disabled"].includes(status)) redirect(q("/employee/users", { error: "Invalid update." }));
  if (user_id === s.user.id && (status !== "active" || role !== s.profile.role)) redirect(q("/employee/users", { error: "You cannot change your own role or status." }));
  const patch: Record<string, unknown> = { role, status, display_name };
  if (status === "disabled") patch.disabled_at = new Date().toISOString();
  const { error, count } = await s.client.from("portal_users").update(patch, { count: "exact" }).eq("user_id", user_id);
  if (error) redirect(q("/employee/users", { error: error.message }));
  if (!count) redirect(q("/employee/users", { error: "Not permitted for that account." }));
  redirect(q("/employee/users", { updated: "1" }));
}

/* ------------------------------------------------------------------ media library */
export async function uploadMedia(formData: FormData) {
  const s = await requirePortal("contributor");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) redirect(q("/employee/media", { error: "Choose a file." }));
  const ext = MEDIA_TYPES[file.type];
  if (!ext) redirect(q("/employee/media", { error: `File type not allowed (${file.type || "unknown"}). Allowed: JPG, PNG, WebP, PDF, DOCX, XLSX, CSV, MP4.` }));
  if (file.size > MEDIA_MAX_BYTES) redirect(q("/employee/media", { error: "Files must be 50 MB or smaller." }));
  if (str(formData, "attest") !== "on") redirect(q("/employee/media", { error: "Confirm the file contains no classified, CUI, export-controlled or otherwise sensitive material." }));

  const visibility = (["public", "employee", "hidden"].includes(str(formData, "visibility")) ? str(formData, "visibility") : "public") as "public" | "employee" | "hidden";
  const bucket = visibility === "public" ? "public-media" : "private-media";
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9.-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || `file.${ext}`;
  const d = new Date();
  const path = `${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}-${safeName}`;

  const { error: upError } = await s.client.storage.from(bucket).upload(path, file, { contentType: file.type, upsert: false });
  if (upError) redirect(q("/employee/media", { error: upError.message }));

  const replaceId = str(formData, "replace_id") || null;
  const { error } = await s.client.from("media_assets").insert({
    bucket, path, file_name: file.name, mime_type: file.type, size_bytes: file.size, visibility,
    title: str(formData, "title") || file.name, description: str(formData, "description") || null,
    alt_text: str(formData, "alt_text") || null, category: str(formData, "category") || null,
    previous_asset_id: replaceId, uploaded_by: s.user.id,
  });
  if (error) {
    await s.client.storage.from(bucket).remove([path]);
    redirect(q("/employee/media", { error: error.message }));
  }
  if (replaceId) await s.client.from("media_assets").update({ deleted_at: new Date().toISOString() }).eq("id", replaceId);
  redirect(q("/employee/media", { uploaded: "1" }));
}

export async function deleteMedia(formData: FormData) {
  const s = await requirePortal("admin");
  const id = str(formData, "id");
  const { data } = await s.client.from("media_assets").select("bucket, path").eq("id", id).single();
  if (!data) redirect(q("/employee/media", { error: "File not found." }));
  await s.client.storage.from(data.bucket).remove([data.path]);
  const { error } = await s.client.from("media_assets").delete().eq("id", id);
  if (error) redirect(q("/employee/media", { error: error.message }));
  redirect(q("/employee/media", { deleted: "1" }));
}

/* ------------------------------------------------------------------ settings */
export async function saveSettings(formData: FormData) {
  const s = await requirePortal("admin");
  const rows = SETTING_KEYS.map(({ key }) => ({ key, value: str(formData, key), updated_by: s.user.id }));
  const { error } = await s.client.from("site_settings").upsert(rows, { onConflict: "key" });
  if (error) redirect(q("/employee/settings", { error: error.message }));
  await s.client.rpc("log_portal_event", { p_action: "update", p_summary: "Site settings updated", p_table: "site_settings" });
  revalidatePath("/", "layout");
  redirect(q("/employee/settings", { saved: "1" }));
}
