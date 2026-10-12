/** Portal roles, lowest to highest. Mirrors the portal_role enum. Safe to import from client components. */
export const ROLES = ["viewer", "contributor", "editor", "admin", "super_admin"] as const;
export type PortalRole = (typeof ROLES)[number];
export const roleRank = (r: PortalRole) => ROLES.indexOf(r);
export const atLeast = (r: PortalRole | undefined, min: PortalRole) => r !== undefined && roleRank(r) >= roleRank(min);

export type PortalProfile = {
  user_id: string;
  email: string;
  display_name: string | null;
  role: PortalRole;
  status: "invited" | "active" | "disabled";
  last_sign_in_at: string | null;
  created_at: string;
};
