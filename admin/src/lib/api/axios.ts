/**
 * Axios Configuration for API Requests
 * Supports both Server-Side (SSR/ISR) and Client-Side requests
 */

import { envVars } from "@/config";
import axios, { AxiosError, type AxiosInstance } from "axios";
import { toast } from "react-toastify";

/**
 * Create Axios instance for Client-Side Rendering
 * Used in Client Components with authentication support
 */
export const createClientAxios = (): AxiosInstance => {
	const instance = axios.create({
		baseURL: envVars.BASE_API_URL,
		headers: {
			"Content-Type": "application/json",
		},
		timeout: 10000,
		withCredentials: true, // Important for cookie-based auth
	});

	// Request interceptor - Add auth token from cookies/localStorage
	instance.interceptors.request.use(
		(config) => {
			// If you're using JWT in localStorage
			const storageData = localStorage.getItem("auth-storage")
				? JSON.parse(localStorage.getItem("auth-storage") || "")
				: null;
			if (storageData?.state?.accessToken) {
				config.headers.Authorization = `Bearer ${storageData.state.accessToken}`;
			}

			// Remove Content-Type header for FormData so axios can set it automatically with boundary
			if (config.data instanceof FormData) {
				delete config.headers["Content-Type"];
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
				!originalRequest?.url?.includes("/auth/staff/login") &&
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
