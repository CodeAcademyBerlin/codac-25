import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  // Monitor header sizes to debug 431 errors in development
  if (process.env.NODE_ENV === 'development') {
    const headerSize = JSON.stringify(Object.fromEntries(req.headers)).length;
    const cookieSize = req.headers.get('cookie')?.length || 0;

    if (headerSize > 16000 || cookieSize > 8000) {
      console.warn(`⚠️  Large request headers detected:
        - Total header size: ${headerSize} bytes
        - Cookie size: ${cookieSize} bytes
        - URL: ${req.nextUrl.pathname}
        - User-Agent: ${req.headers.get('user-agent')?.substring(0, 100)}...`);
    }
  }

  const isAuthPage = req.nextUrl.pathname.startsWith("/auth");
  const isApiAuthRoute = req.nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute = [
    "/",
    "/auth/signin",
    "/auth/signout",
    "/auth/error",
    "/auth/verify-request",
  ].includes(req.nextUrl.pathname);

  // Allow API auth routes
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get token without importing the full auth configuration
  const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

  if (!authSecret) {
    console.error("AUTH_SECRET environment variable is required for middleware authentication");
    // Allow request to proceed if no secret is configured
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: authSecret
  });

  const isLoggedIn = !!token;

  // Redirect authenticated users away from auth pages to dashboard
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  // Redirect unauthenticated users to signin for protected routes
  if (!isLoggedIn && !isAuthPage) {
    const callbackUrl = req.nextUrl.pathname + req.nextUrl.search;
    return NextResponse.redirect(
      new URL(
        `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`,
        req.nextUrl.origin
      )
    );
  }

  // Allow the request to proceed
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