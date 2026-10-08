import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/token";

/**
 * First line of defense for the admin area. Every admin page, server action and
 * route handler verifies the session again on its own; this is never the only check.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authed = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname.startsWith("/api/admin")) {
    if (!authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.next();
  }

  if (pathname === "/admin/login") {
    if (authed && request.method === "GET") return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.next();
  }

  if (!authed) {
    // Server action POSTs get a 401 instead of a redirect they cannot follow.
    if (request.method !== "GET" && request.method !== "HEAD") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const login = new URL("/admin/login", request.url);
    if (pathname !== "/admin") login.searchParams.set("from", pathname);
    const response = NextResponse.redirect(login);
    // Clear a stale cookie (e.g. after the admin password changed).
    if (request.cookies.has(SESSION_COOKIE)) response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
