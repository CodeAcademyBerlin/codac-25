import { NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
    const isAuthPage = request.nextUrl.pathname.startsWith("/auth")
    const isApiAuthRoute = request.nextUrl.pathname.startsWith("/api/auth")
    const isPublicRoute = ["/", "/auth/signin", "/auth/signout", "/auth/error", "/auth/verify-request"].includes(request.nextUrl.pathname)

    // Allow API auth routes
    if (isApiAuthRoute) {
        return NextResponse.next()
    }

    // Allow public routes
    if (isPublicRoute) {
        return NextResponse.next()
    }

    // Check if user has session cookie (simple check)
    const sessionToken = request.cookies.get("next-auth.session-token") ||
        request.cookies.get("__Secure-next-auth.session-token") ||
        request.cookies.get("authjs.session-token")

    const isLoggedIn = !!sessionToken

    // Redirect authenticated users away from auth pages
    if (isAuthPage && isLoggedIn) {
        return NextResponse.redirect(new URL("/", request.nextUrl.origin))
    }

    // Redirect unauthenticated users to signin for protected routes
    if (!isLoggedIn && !isAuthPage) {
        const callbackUrl = request.nextUrl.pathname + request.nextUrl.search
        return NextResponse.redirect(
            new URL(`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`, request.nextUrl.origin)
        )
    }

    return NextResponse.next()
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
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
} 