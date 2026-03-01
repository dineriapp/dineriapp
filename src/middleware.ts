import { NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { getSessionCookie } from "better-auth/cookies";
import { routing } from "./i18n/routing";

const locales = ["en", "de", "es", "fr", "it", "nl"];

// 🧭 Internationalization Middleware
const intlMiddleware = createIntlMiddleware(routing);

export default async function middleware(request: NextRequest) {
    const { pathname, origin, search } = request.nextUrl;

    // 1. Run i18n middleware first
    const intlResponse = intlMiddleware(request);
    if (intlResponse) {
        // If i18n rewrote or redirected, respect it
        if (intlResponse.status !== 200) return intlResponse;
    }

    // 1. Split pathname
    let normalizedPath = pathname;
    const segments = pathname.split("/").filter(Boolean);

    // 2. If first segment is a locale, remove it
    if (segments.length > 0 && locales.includes(segments[0])) {
        normalizedPath = "/" + segments.slice(1).join("/");
        // If everything was just the locale (like "/en"), normalize to "/"
        if (normalizedPath === "/") normalizedPath = "/";
    }


    // 2. Protected route logic for better-auth
    const isProtected =
        normalizedPath.startsWith("/dashboard")

    const isAuthPage = normalizedPath === "/login" || normalizedPath === "/sign-up";

    if (isProtected || isAuthPage) {
        const session = getSessionCookie(request);

        if (isProtected && !session) {
            return NextResponse.redirect(new URL(`/login${search}`, origin));
        }

        if (isAuthPage && session) {
            return NextResponse.redirect(new URL(`/dashboard${search}`, origin));
        }
    }

    return intlResponse || NextResponse.next();
}

export const config = {
    matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
