/**
 * Authentication API Service
 */

import { clientApi } from "./axios";

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface LoginResponse {
	access: string;
	refresh: string;
	user: User;
}

export interface RegisterData {
	email: string;
	password: string;
	first_name: string;
	last_name: string;
	mobile_number: string;
}

export interface AuthTokens {
	access: string;
	refresh: string;
}

export interface User {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
}

/**
 * Authentication API (Client-side only)
 */
export const authApi = {
	/**
	 * Login user
	 */
	async login(credentials: LoginCredentials): Promise<LoginResponse> {
		const { data } = await clientApi.post<LoginResponse>(
			"/auth/login/",
			credentials
		);
		return data;
	},

	/**
	 * Register new user
	 */
	async register(userData: RegisterData): Promise<AuthTokens> {
		const { data } = await clientApi.post<AuthTokens>(
			"/auth/register/",
			userData
		);
		return data;
	},

	/**
	 * Logout user
	 */
	async logout(): Promise<void> {
		await clientApi.post("/auth/logout/");
	},

	/**
	 * Refresh access token
	 */
	async refreshToken(): Promise<AuthTokens> {
		const { data } = await clientApi.post<AuthTokens>("/auth/token/refresh/");
		return data;
	},

	/**
	 * Request password reset
	 */
	async requestPasswordReset(email: string): Promise<void> {
		await clientApi.post("/auth/password-reset/", { email });
	},

	/**
	 * Confirm password reset
	 */
	async confirmPasswordReset(token: string, password: string): Promise<void> {
		await clientApi.post("/auth/password-reset/confirm/", {
			token,
			password,
		});
	},
};
