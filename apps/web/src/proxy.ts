import { NextRequest, NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const PROTECTED_PREFIXES = ["/dashboard", "/analytics"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect authenticated routes
  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p));
  if (!isProtected) {
    return NextResponse.next();
  }

  // Forward the session cookie to the API to validate
  const cookie = request.headers.get("cookie") || "";

  try {
    const res = await fetch(`${API}/auth/me`, {
      headers: { cookie },
    });

    if (!res.ok) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    // API unreachable — let the page handle it gracefully
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/analytics/:path*"],
};
