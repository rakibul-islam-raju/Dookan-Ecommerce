/**
 * Authentication API Service
 */

import { IOrderShippingAddressRequest } from "@/@types/Order";
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
	mobile_number?: string;
	is_active: boolean;
	is_email_verified: boolean;
	date_joined: string;
	default_address?: IOrderShippingAddressRequest;
}

// Email Verification Types
export interface VerifyEmailRequest {
	email: string;
	otp_code: string;
}

export interface VerifyEmailResponse {
	message: string;
}

export interface ResendVerificationRequest {
	email: string;
}

export interface ResendVerificationResponse {
	message: string;
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
	async register(
		userData: RegisterData
	): Promise<Omit<RegisterData, "password"> & { id: string }> {
		const { data } = await clientApi.post<
			Omit<RegisterData, "password"> & { id: string }
		>("/auth/register/", userData);
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

	/**
	 * Verify email with OTP
	 */
	async verifyEmail(data: VerifyEmailRequest): Promise<VerifyEmailResponse> {
		const { data: response } = await clientApi.post<VerifyEmailResponse>(
			"/auth/verify-email/",
			data
		);
		return response;
	},

	/**
	 * Resend verification OTP
	 */
	async resendVerification(
		data: ResendVerificationRequest
	): Promise<ResendVerificationResponse> {
		const { data: response } = await clientApi.post<ResendVerificationResponse>(
			"/auth/resend-verification/",
			data
		);
		return response;
	},
};
