/**
 * Axios Configuration for API Requests
 * Supports both Server-Side (SSR/ISR) and Client-Side requests
 */

import { COOKIES_KEYS } from "@/config";
import { getApiUrl } from "@/config/env";
import axios, { AxiosError, AxiosInstance } from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

/**
 * Create Axios instance for Server-Side Rendering
 * Used in Server Components, generateStaticParams, etc.
 */
export const createServerAxios = (): AxiosInstance => {
	const baseURL = getApiUrl(true);

	// Log the baseURL for debugging (only in development)
	if (process.env.NODE_ENV === "development") {
		console.log("[Server API] Base URL:", baseURL);
	}

	const instance = axios.create({
		baseURL,
		headers: {
			"Content-Type": "application/json",
		},
		timeout: 10000,
		// Force IPv4 by using family: 4 (if supported)
		// Note: This might not work in all axios versions, so we use 127.0.0.1 in env.ts instead
	});

	// Response interceptor for error handling
	instance.interceptors.response.use(
		(response) => response,
		(error: AxiosError) => {
			const baseURL = error.config?.baseURL;
			const url = error.config?.url;
			const fullUrl = baseURL && url ? `${baseURL}${url}` : url || "unknown";

			console.log("[Server API Error]:", {
				url: fullUrl,
				method: error.config?.method?.toUpperCase(),
				status: error.response?.status,
				statusText: error.response?.statusText,
				message: error.message,
				responseData: error.response?.data,
				code: error.code,
			});
			return Promise.reject(error);
		}
	);

	return instance;
};

/**
 * Create Axios instance for Client-Side Rendering
 * Used in Client Components with authentication support
 */
export const createClientAxios = (): AxiosInstance => {
	const instance = axios.create({
		baseURL: getApiUrl(false),
		headers: {
			"Content-Type": "application/json",
		},
		timeout: 10000,
		withCredentials: true, // Important for cookie-based auth
	});

	// Request interceptor - Add auth token from cookies/localStorage
	instance.interceptors.request.use(
		(config) => {
			// if user is logged in, add the access token to the headers
			const accessToken = Cookies.get(COOKIES_KEYS.ACCESS_TOKEN);
			if (accessToken) {
				config.headers.Authorization = `Bearer ${accessToken}`;
			}
			// For cookie-based auth, cookies are sent automatically with withCredentials: true
			return config;
		},
		(error) => Promise.reject(error)
	);

	// Response interceptor for error handling
	instance.interceptors.response.use(
		(response) => response,
		async (error: AxiosError) => {
			const originalRequest = error.config;

			// Handle 401 Unauthorized - Token refresh logic
			if (
				error.response?.status === 401 &&
				!originalRequest?.url?.includes("/auth/login") &&
				originalRequest
			) {
				try {
					// Attempt to refresh token
					await instance.post("/auth/token/refresh/");

					// Retry original request
					return instance(originalRequest);
				} catch (refreshError) {
					// Refresh failed - redirect to login
					if (typeof window !== "undefined") {
						window.location.href = "/login";
					}
					return Promise.reject(refreshError);
				}
			}

			// Handle other errors
			const data = error.response?.data as
				| { message?: string; detail?: string }
				| Record<string, string[]>
				| undefined;

			let message =
				data?.message ||
				data?.detail ||
				error.message ||
				"An unexpected error occurred";

			// Handle field-specific errors like {"password": ["This password is too common."]}
			if (
				!data?.message &&
				!data?.detail &&
				typeof data === "object" &&
				data !== null
			) {
				const fieldErrors = Object.values(data).filter(
					(value): value is string[] => Array.isArray(value) && value.length > 0
				);
				if (fieldErrors.length > 0) {
					// Take the first error message from the first field
					message = fieldErrors[0][0];
				}
			}

			toast.error(message);

			return Promise.reject(error);
		}
	);

	return instance;
};

export const serverApi = createServerAxios();

/**
 * Client-side axios instance (for CSR)
 * Import this in Client Components
 */
export const clientApi = createClientAxios();

/**
 * Generic API error type
 */
export interface ApiError {
	message: string;
	status?: number;
	errors?: Record<string, string[]>;
}

/**
 * Extract error message from API error
 */
export function getErrorMessage(error: unknown): string {
	if (axios.isAxiosError(error)) {
		const data = error.response?.data as
			| { message?: string; detail?: string }
			| undefined;
		return data?.message || data?.detail || error.message;
	}
	if (error instanceof Error) {
		return error.message;
	}
	return "An unexpected error occurred";
}
