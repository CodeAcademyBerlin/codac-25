import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Monitor header sizes to debug 431 errors
  const headerSize = JSON.stringify(Object.fromEntries(request.headers)).length;
  const cookieSize = request.headers.get('cookie')?.length || 0;

  if (headerSize > 16000 || cookieSize > 8000) {
    console.warn(`⚠️  Large request headers detected:
      - Total header size: ${headerSize} bytes
      - Cookie size: ${cookieSize} bytes
      - URL: ${request.nextUrl.pathname}
      - User-Agent: ${request.headers.get('user-agent')?.substring(0, 100)}...`);
  }

  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isApiAuthRoute = request.nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute = [
    "/",
    "/auth/signin",
    "/auth/signout",
    "/auth/error",
    "/auth/verify-request",
  ].includes(request.nextUrl.pathname);

  // Allow API auth routes
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if user has session cookie (simple check)
  const sessionToken =
    request.cookies.get("next-auth.session-token") ||
    request.cookies.get("__Secure-next-auth.session-token") ||
    request.cookies.get("authjs.session-token");

  const isLoggedIn = !!sessionToken;

  // Redirect authenticated users away from auth pages
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/", request.nextUrl.origin));
  }

  // Redirect unauthenticated users to signin for protected routes
  if (!isLoggedIn && !isAuthPage) {
    const callbackUrl = request.nextUrl.pathname + request.nextUrl.search;
    return NextResponse.redirect(
      new URL(
        `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`,
        request.nextUrl.origin
      )
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
} 
