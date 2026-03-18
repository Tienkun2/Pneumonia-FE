import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    const publicPaths = [
        "/auth/login",
        "/auth/register",
        "/auth/forgot-password",
        "/auth/activate",
    ];

    const isPublicPath = publicPaths.some((publicPath) =>
        path.startsWith(publicPath)
    );

    const token = request.cookies.get("token")?.value;

    if (isPublicPath && token) {
        if (!path.startsWith("/auth/activate")) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    if (!isPublicPath && !token) {
        if (
            !path.startsWith("/_next") &&
            !path.startsWith("/api") &&
            !path.includes(".")
        ) {
            return NextResponse.redirect(new URL("/auth/login", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};