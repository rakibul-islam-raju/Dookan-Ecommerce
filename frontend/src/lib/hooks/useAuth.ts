/**
 * React Query Hooks for Authentication
 */

"use client";

import {
	authApi,
	type LoginCredentials,
	type RegisterData,
	type ResendVerificationRequest,
	type VerifyEmailRequest,
} from "@/lib/api/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

/**
 * Query Keys for Auth
 */
export const authKeys = {
	all: ["auth"] as const,
	user: () => [...authKeys.all, "user"] as const,
};

/**
 * Hook to login
 */
export function useLogin() {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
		onSuccess: async () => {
			// Invalidate and refetch user data
			await queryClient.invalidateQueries({ queryKey: authKeys.user() });
			router.push("/");
			// toast.success("Logged in successfully");
		},
	});
}

/**
 * Hook to register
 */
export function useRegister() {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: (userData: RegisterData) => authApi.register(userData),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: authKeys.user() });
			router.push("/");
			// toast.success("Account created successfully");
		},
	});
}

/**
 * Hook to logout
 */
export function useLogout() {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: () => authApi.logout(),
		onSuccess: () => {
			// Clear all queries
			queryClient.clear();
			router.push("/login");
			// toast.success("Logged out successfully");
		},
	});
}

/**
 * Hook to verify email with OTP
 */
export function useVerifyEmail() {
	const router = useRouter();

	return useMutation({
		mutationFn: (data: VerifyEmailRequest) => authApi.verifyEmail(data),
		onSuccess: () => {
			toast.success("Email verified successfully! Please login.");
			router.push("/login");
		},
	});
}

/**
 * Hook to resend verification OTP
 */
export function useResendVerification() {
	return useMutation({
		mutationFn: (data: ResendVerificationRequest) =>
			authApi.resendVerification(data),
		onSuccess: () => {
			toast.success("Verification code sent to your email.");
		},
	});
}
