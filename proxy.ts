import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Employee sessions end after this much inactivity (brief §14: session timeout). */
const IDLE_MS = 30 * 60 * 1000;
const SEEN = "tw_portal_seen";

/**
 * Runs on every /employee request: refreshes the Supabase session cookies and enforces the
 * inactivity timeout. Authorization itself happens in requirePortal() and in RLS.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  let response = NextResponse.next({ request });
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return response;

  const last = Number(request.cookies.get(SEEN)?.value ?? 0);
  if (last && Date.now() - last > IDLE_MS && !request.nextUrl.pathname.startsWith("/employee/auth/")) {
    return NextResponse.redirect(new URL("/employee/auth/signout?reason=timeout", request.url));
  }
  response.cookies.set(SEEN, String(Date.now()), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/employee", maxAge: 60 * 60 * 24,
  });
  return response;
}

export const config = { matcher: ["/employee/:path*"] };
