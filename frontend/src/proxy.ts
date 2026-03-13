import { NextRequest, NextResponse } from "next/server";

// Define route patterns
const authRoutes = ["/login", "/register", "/forgot-password"];
const protectedRoutes = [
	"/account",
	"/orders",
	"/profile",
	// "/checkout",
	"/wishlist",
];

// Check if user is authenticated by looking for access token
function isAuthenticated(request: NextRequest): boolean {
	const accessToken = request.cookies.get("vinMart_access_token")?.value;
	console.log("accessToken------------>", accessToken);
	return !!accessToken;
}

// Check if path matches any of the patterns
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
		pathname.includes(".") ||
		pathname === "/"
	) {
		return NextResponse.next();
	}

	// If user is authenticated and trying to access auth routes, redirect to home
	if (isAuth && matchesRoute(pathname, authRoutes)) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	// If user is not authenticated and trying to access protected routes, redirect to login
	if (!isAuth && matchesRoute(pathname, protectedRoutes)) {
		const loginUrl = new URL("/login", request.url);
		// Add the current path as a redirect parameter
		loginUrl.searchParams.set("redirect", pathname);
		return NextResponse.redirect(loginUrl);
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
