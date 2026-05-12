import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

function isPublicPath(pathname: string) {
	return (
		pathname.startsWith("/_next") ||
		pathname.startsWith("/api") ||
		pathname === "/favicon.ico" ||
		pathname === "/robots.txt" ||
		pathname === "/sitemap.xml" ||
		/\.[a-zA-Z0-9]+$/.test(pathname)
	);
}

export default function proxy(request: NextRequest) {
	const { pathname, search } = request.nextUrl;

	if (isPublicPath(pathname)) {
		return NextResponse.next();
	}

	if (pathname === "/") {
		return NextResponse.redirect(new URL(`/${routing.defaultLocale}`, request.url));
	}

	const hasLocalePrefix = routing.locales.some(
		(locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
	);

	if (!hasLocalePrefix) {
		return NextResponse.redirect(new URL(`/en${pathname}${search}`, request.url));
	}

	return intlMiddleware(request);
}

export const config = {
	matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
