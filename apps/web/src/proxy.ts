import { NextRequest, NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/** Routes that require authentication — redirect to login if unauthenticated */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/analytics",
  "/teams",
  "/monitoring",
  "/billing",
  "/templates/new",
];

/** Routes that redirect TO dashboard if already authenticated */
const AUTH_ROUTES = ["/login"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if trying to access a protected route
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (isProtected) {
    const cookie = request.headers.get("cookie") || "";
    try {
      const res = await fetch(`${API}/auth/me`, { headers: { cookie } });
      if (!res.ok) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      // API unreachable — let the page handle it gracefully
    }
  }

  // If already authenticated, redirect away from auth pages
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  if (isAuthRoute) {
    const cookie = request.headers.get("cookie") || "";
    try {
      const res = await fetch(`${API}/auth/me`, { headers: { cookie } });
      if (res.ok) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch {
      // API unreachable — let login page render
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/analytics/:path*",
    "/teams/:path*",
    "/monitoring/:path*",
    "/billing/:path*",
    "/templates/new",
    "/login",
  ],
};
