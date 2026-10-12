import { NextResponse, type NextRequest } from "next/server";
import { createPortalClient, supabaseConfigured } from "@/lib/supabase/server";

/** Used by proxy.ts for the inactivity timeout (a redirect cannot carry Supabase's cookie updates itself). */
export async function GET(request: NextRequest) {
  if (supabaseConfigured()) {
    const client = await createPortalClient();
    const { data: { user } } = await client.auth.getUser();
    if (user) await client.rpc("log_portal_event", { p_action: "sign_out", p_summary: "Inactivity timeout" });
    await client.auth.signOut();
  }
  const reason = request.nextUrl.searchParams.get("reason");
  const res = NextResponse.redirect(new URL(reason === "timeout" ? "/employee?timeout=1" : "/employee?signedout=1", request.nextUrl));
  res.cookies.delete("tw_portal_seen");
  return res;
}
