import { NextRequest, NextResponse } from "next/server";
import { COOKIES_KEYS } from "@/config";

const authRoutes = ["/login", "/register", "/forgot-password", "/verify-email"];
const protectedRoutes = ["/profile", "/orders", "/wishlist", "/addresses"];
const publicRoutes = ["/", "/shop", "/products", "/cart", "/checkout", "/track-order"];

function isAuthenticated(request: NextRequest): boolean {
	const accessToken = request.cookies.get(COOKIES_KEYS.ACCESS_TOKEN)?.value;
	return !!accessToken;
}

function matchesRoute(pathname: string, routes: string[]): boolean {
	return routes.some((route) => pathname.startsWith(route));
}

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const isAuth = isAuthenticated(request);

	// Skip middleware for API routes, static files, and Next.js internals
	if (
		pathname.startsWith("/api") ||
		pathname.startsWith("/_next") ||
		pathname.startsWith("/favicon") ||
		pathname.includes(".")
	) {
		return NextResponse.next();
	}

	if (isAuth && matchesRoute(pathname, authRoutes)) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	if (!isAuth && matchesRoute(pathname, protectedRoutes)) {
		const loginUrl = new URL("/login", request.url);
		const redirectPath = `${pathname}${request.nextUrl.search}`;
		loginUrl.searchParams.set("redirect", redirectPath);
		return NextResponse.redirect(loginUrl);
	}

	if (matchesRoute(pathname, authRoutes) || matchesRoute(pathname, publicRoutes)) {
		return NextResponse.next();
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public files with extensions
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)",
	],
};
