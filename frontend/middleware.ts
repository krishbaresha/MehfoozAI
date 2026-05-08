import { NextRequest, NextResponse } from "next/server";

/**
 * MehfoozAI — Route Protection Middleware
 *
 * Guards the /dashboard route so that only authenticated users
 * (those who have a valid mhz_auth cookie set after login) can access it.
 * Anyone who pastes /dashboard directly in the URL will be immediately
 * redirected to /login by the server — before any page code runs.
 */

const PROTECTED_PATHS = ["/dashboard"];
const AUTH_COOKIE = "mhz_auth";
const VALID_TOKEN = "MHZ-AUTH-8829";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );

  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get(AUTH_COOKIE)?.value;

  if (!token || token !== VALID_TOKEN) {
    const loginUrl = new URL("/login", request.url);
    // Preserve the original destination so we can redirect back after login
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
};
