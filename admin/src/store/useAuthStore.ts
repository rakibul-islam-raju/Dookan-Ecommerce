import { localStorageKeys } from "@/config";
import type { User } from "@/lib/api/auth";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
	user: User | null;
	accessToken: string | null;
	refreshToken: string | null;
	isAuthenticated: boolean;
	setAuth: (user: User, accessToken: string, refreshToken: string) => void;
	logout: () => void;
	setUser: (user: User) => void;
	setTokens: (accessToken: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			accessToken: null,
			refreshToken: null,
			isAuthenticated: false,
			setAuth: (user, accessToken, refreshToken) => {
				set({
					user,
					accessToken,
					refreshToken,
					isAuthenticated: true,
				});
			},
			logout: () => {
				// Remove cookies
				localStorage.removeItem(localStorageKeys.ACCESS_TOKEN);
				localStorage.removeItem(localStorageKeys.REFRESH_TOKEN);

				set({
					user: null,
					accessToken: null,
					refreshToken: null,
					isAuthenticated: false,
				});
			},
			setUser: (user) => {
				set({ user });
			},
			setTokens: (accessToken, refreshToken) => {
				set({ accessToken, refreshToken });
			},
		}),
		{
			name: "auth-storage",
			partialize: (state) => ({
				user: state.user,
				accessToken: state.accessToken,
				refreshToken: state.refreshToken,
				isAuthenticated: state.isAuthenticated,
			}),
		}
	)
);
