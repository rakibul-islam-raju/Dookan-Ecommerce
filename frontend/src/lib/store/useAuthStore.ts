import { COOKIES_KEYS } from "@/config";
import { User } from "@/lib/api/auth";
import Cookies from "js-cookie";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Grab tokens from cookies
const accessToken = Cookies.get(COOKIES_KEYS.ACCESS_TOKEN);
const refreshToken = Cookies.get(COOKIES_KEYS.REFRESH_TOKEN);

interface AuthState {
	user: User | null;
	accessToken: string | null;
	refreshToken: string | null;
	isAuthenticated: boolean;
	setAuth: (user: User, accessToken: string, refreshToken: string) => void;
	updateUser: (user: User) => void;
	logout: () => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			accessToken: accessToken || null,
			refreshToken: refreshToken || null,
			isAuthenticated: !!accessToken,
			setAuth: (user, accessToken, refreshToken) => {
				// Set cookies with appropriate settings for localhost (HTTP) and production (HTTPS)
				// Use NEXT_PUBLIC_COOKIE_SECURE environment variable to control secure flag
				// Default to false for HTTP frontend in production
				const isSecureCookie = process.env.NEXT_PUBLIC_COOKIE_SECURE === "true";

				const cookieOptions = {
					expires: 1, // 1 day for access token
					sameSite: "lax" as const,
					secure: isSecureCookie,
				};

				const refreshCookieOptions = {
					expires: 7, // 7 days for refresh token
					sameSite: "lax" as const,
					secure: isSecureCookie,
				};

				Cookies.set(COOKIES_KEYS.ACCESS_TOKEN, accessToken, cookieOptions);
				Cookies.set(
					COOKIES_KEYS.REFRESH_TOKEN,
					refreshToken,
					refreshCookieOptions
				);

				set({
					user,
					accessToken,
					refreshToken,
					isAuthenticated: true,
				});
			},
			updateUser: (user) => {
				set({ user });
			},
			logout: () => {
				// Remove cookies
				Cookies.remove(COOKIES_KEYS.ACCESS_TOKEN);
				Cookies.remove(COOKIES_KEYS.REFRESH_TOKEN);

				set({
					user: null,
					accessToken: null,
					refreshToken: null,
					isAuthenticated: false,
				});
			},
		}),
		{
			name: "auth-storage",
			partialize: (state) => ({ user: state.user }), // Only persist user to localStorage, tokens are in cookies
		}
	)
);
