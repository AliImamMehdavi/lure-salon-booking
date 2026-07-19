import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "zenith_salon_session";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isAdminApi = pathname.startsWith("/api/admin") && pathname !== "/api/admin/login";

  if (isAdminRoute || isAdminApi) {
    const session = req.cookies.get(SESSION_COOKIE)?.value;
    if (!session) {
      if (isAdminApi) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      }
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
    // Signature validity (not just presence) is re-checked inside each
    // route/page via requireSalonId() — this proxy layer is a fast-path
    // redirect for the common case, not the actual security boundary.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
