/**
 * Environment Configuration
 * Centralized access to environment variables with type safety
 */

export const env = {
	// API URLs
	api: {
		// Client-side API URL (must be prefixed with NEXT_PUBLIC_)
		baseUrl: process.env.NEXT_PUBLIC_API_URL!,
		baseAppUrl: process.env.NEXT_PUBLIC_BASE_APP_URL!,

		// Server-side API URL (use 127.0.0.1 to avoid IPv6 issues in Node.js)
		serverUrl: process.env.NEXT_PUBLIC_API_URL!,
	},

	// Authentication
	auth: {
		accessTokenCookie:
			process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || "access_token",
		refreshTokenCookie:
			process.env.NEXT_PUBLIC_REFRESH_COOKIE_NAME || "refresh_token",
	},

	// ISR Revalidation times (in seconds)
	revalidate: {
		products: Number(process.env.REVALIDATE_PRODUCTS) || 3600, // 1 hour
		categories: Number(process.env.REVALIDATE_CATEGORIES) || 7200, // 2 hours
		orders: 0, // No cache for user-specific data
	},

	environment:{
		on_https: process.env.ON_HTTPS || false,
	}
} as const;

/**
 * Normalize URL to use IPv4 (127.0.0.1) instead of localhost for server-side requests
 * This prevents IPv6 (::1) connection issues in Node.js
 */
function normalizeServerUrl(url: string | undefined): string {
	if (!url) {
		throw new Error("NEXT_PUBLIC_API_URL environment variable is not defined");
	}
	// Replace localhost with 127.0.0.1 for server-side requests to avoid IPv6 issues
	if (url.includes("localhost") && typeof window === "undefined") {
		return url.replace("localhost", "127.0.0.1");
	}
	return url;
}

/**
 * Helper to get the appropriate API URL based on environment
 * @param isServer - Whether the request is from server-side
 */
export function getApiUrl(isServer = typeof window === "undefined"): string {
	const url = isServer ? env.api.serverUrl : env.api.baseUrl;
	// Normalize server URLs to use IPv4
	return isServer ? normalizeServerUrl(url) : url;
}
