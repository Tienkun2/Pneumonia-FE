import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // Get the path
    const path = request.nextUrl.pathname;

    // Define public paths that don't require authentication
    const publicPaths = ["/login", "/register", "/forgot-password"];

    // Check if the path is public
    const isPublicPath = publicPaths.some(publicPath => path.startsWith(publicPath));

    // Get the token from cookies (we need to sync localStorage with cookies or just use cookies for auth)
    // For this mock implementation with pure Client Components using localStorage, 
    // Next.js Middleware runs on the server and CANNOT access localStorage.

    // OPTION 1: Use cookies for token (Best practice).
    // OPTION 2: Client-side protection (Use a Layout wrapper).

    // Since we implemented localStorage in auth-service, Middleware won't see it.
    // We need to switch to using cookies or accept that this middleware won't work perfectly 
    // without a real backend setting httpOnly cookies.

    // However, we can mock it by assuming we set a cookie 'token' when we login.
    // Let's modify login-form.tsx to set a cookie as well for the middleware to read.

    const token = request.cookies.get("token")?.value;

    // Redirect logic
    if (isPublicPath && token) {
        // If user is already logged in and tries to access login page, redirect to dashboard
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (!isPublicPath && !token) {
        // If trying to access protected route without token
        // Exclude static files and api routes
        if (
            !path.startsWith("/_next") &&
            !path.startsWith("/api") &&
            !path.includes(".") // images, etc
        ) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
