import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createPortalClient, supabaseConfigured } from "@/lib/supabase/server";

/** Lands invitation and password-reset links, exchanges the token for a session, then continues to `next`. */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const rawNext = url.searchParams.get("next") ?? "/employee/set-password";
  const next = rawNext.startsWith("/employee") ? rawNext : "/employee/set-password";
  if (!supabaseConfigured()) return NextResponse.redirect(new URL("/employee", url));

  const client = await createPortalClient();
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  const { error } = code
    ? await client.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await client.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: { message: "Missing token" } };

  if (error) return NextResponse.redirect(new URL("/employee?error=" + encodeURIComponent("That link is invalid or has expired. Ask an admin for a new invitation or request a reset."), url));
  return NextResponse.redirect(new URL(next, url));
}
