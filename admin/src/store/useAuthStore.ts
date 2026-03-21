import { localStorageKeys } from "@/config";
import type { Permission, User } from "@/@types/User.type";
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
	hasPermission: (permission: Permission) => boolean;
	hasAnyPermission: (permissions: Permission[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
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
			hasPermission: (permission) => {
				const user = get().user;
				if (!user) return false;
				if (user.is_superuser) return true;
				return user.permissions?.includes(permission) ?? false;
			},
			hasAnyPermission: (permissions) => {
				const user = get().user;
				if (!user) return false;
				if (user.is_superuser) return true;
				return permissions.some((p) => user.permissions?.includes(p) ?? false);
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
