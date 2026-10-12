import type { Metadata } from "next";
import { Btn, Card, fmtDateTime, inputClass, Label, Notice, PortalShell, RoleBadge, Table, td, th, type Params } from "@/components/portal/ui";
import { inviteUser, updateUser } from "@/lib/portal/actions";
import { listUsers } from "@/lib/portal/queries";
import { requirePortal, ROLES } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Users", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const s = await requirePortal("admin");
  const users = await listUsers(s.client);
  const assignable = s.profile.role === "super_admin" ? ROLES : ROLES.filter((r) => r !== "admin" && r !== "super_admin");
  const serviceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  return (
    <PortalShell session={s} title="Users" current="/employee/users">
      <Notice params={sp} />
      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <Table head={<><th className={th}>Account</th><th className={th}>Role</th><th className={th}>Status</th><th className={th}>Last sign-in</th><th className={th}><span className="sr-only">Save</span></th></>}>
          {users.map((u) => {
            const self = String(u.user_id) === s.user.id;
            const locked = self || (s.profile.role !== "super_admin" && (u.role === "admin" || u.role === "super_admin"));
            return (
              <tr key={String(u.user_id)}>
                <td className={td} colSpan={locked ? 1 : 1}>
                  <form id={`u-${u.user_id}`} action={updateUser}><input type="hidden" name="user_id" value={String(u.user_id)} /></form>
                  <p className="font-semibold">{String(u.email)}{self && <span className="ml-2 text-xs font-normal text-ink-muted">(you)</span>}</p>
                  {locked ? <p className="text-xs text-ink-muted">{String(u.display_name ?? "")}</p> : <input form={`u-${u.user_id}`} name="display_name" defaultValue={String(u.display_name ?? "")} placeholder="Display name" aria-label="Display name" className={`${inputClass} mt-1 w-48`} />}
                </td>
                <td className={td}>
                  {locked ? <RoleBadge role={String(u.role)} /> : (
                    <select form={`u-${u.user_id}`} name="role" defaultValue={String(u.role)} aria-label="Role" className={`${inputClass} w-40`}>
                      {assignable.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                    </select>
                  )}
                </td>
                <td className={td}>
                  {locked ? <span className="text-sm">{String(u.status)}</span> : (
                    <select form={`u-${u.user_id}`} name="status" defaultValue={String(u.status)} aria-label="Status" className={`${inputClass} w-32`}>
                      <option value="invited">invited</option><option value="active">active</option><option value="disabled">disabled</option>
                    </select>
                  )}
                </td>
                <td className={`${td} whitespace-nowrap text-ink-muted`}>{fmtDateTime(u.last_sign_in_at)}</td>
                <td className={td}>{!locked && <Btn form={`u-${u.user_id}`} type="submit" variant="secondary" small>Save</Btn>}</td>
              </tr>
            );
          })}
        </Table>
        <Card title="Invite an employee">
          {!serviceKey && <p className="mb-4 rounded-md border border-runway/50 bg-runway-tint p-3 text-xs text-[#8a4100]">Invites need SUPABASE_SERVICE_ROLE_KEY on the server. Accounts can still be created in the Supabase dashboard and added to portal_users.</p>}
          <form action={inviteUser} className="space-y-4">
            <div><Label htmlFor="email">Work email</Label><input id="email" name="email" type="email" required className={`${inputClass} mt-1`} /></div>
            <div><Label htmlFor="display_name">Display name</Label><input id="display_name" name="display_name" className={`${inputClass} mt-1`} /></div>
            <div>
              <Label htmlFor="role">Role</Label>
              <select id="role" name="role" defaultValue="contributor" className={`${inputClass} mt-1`}>
                {assignable.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
              </select>
              <p className="mt-2 text-xs text-ink-muted">Viewer: read-only · Contributor: drafts · Editor: drafts + submit for review · Admin: publish, approve, users, files · Super admin: everything.</p>
            </div>
            <Btn type="submit" className="w-full" disabled={!serviceKey}>Send invitation</Btn>
          </form>
        </Card>
      </div>
    </PortalShell>
  );
}
