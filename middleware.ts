import { auth } from "@/lib/auth/auth"

export default auth((req) => {
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
    return undefined;
  }

  // Allow public routes
  if (isPublicRoute) {
    return undefined;
  }

  const isLoggedIn = !!req.auth;

  // Redirect authenticated users away from auth pages
  if (isAuthPage && isLoggedIn) {
    return Response.redirect(new URL("/", req.nextUrl.origin));
  }

  // Redirect unauthenticated users to signin for protected routes
  if (!isLoggedIn && !isAuthPage) {
    const callbackUrl = req.nextUrl.pathname + req.nextUrl.search;
    return Response.redirect(
      new URL(
        `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`,
        req.nextUrl.origin
      )
    );
  }
  
  // Allow the request to proceed
  return undefined;
})

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
