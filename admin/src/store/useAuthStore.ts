import { localStorageKeys } from "@/config";
import type { IVendorContext, Permission, User } from "@/@types/User.type";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
	user: User | null;
	accessToken: string | null;
	refreshToken: string | null;
	isAuthenticated: boolean;
	vendorContext: IVendorContext | null;
	setAuth: (user: User, accessToken: string, refreshToken: string) => void;
	logout: () => void;
	setUser: (user: User) => void;
	setTokens: (accessToken: string, refreshToken: string) => void;
	setVendorContext: (ctx: IVendorContext) => void;
	hasPermission: (permission: Permission) => boolean;
	hasAnyPermission: (permissions: Permission[]) => boolean;
	hasFeature: (feature: string) => boolean;
	canAccessInventory: () => boolean;
	canAccessExpenses: () => boolean;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			user: null,
			accessToken: null,
			refreshToken: null,
			isAuthenticated: false,
			vendorContext: null,
			setAuth: (user, accessToken, refreshToken) => {
				set({
					user,
					accessToken,
					refreshToken,
					isAuthenticated: true,
				});
			},
			logout: () => {
				localStorage.removeItem(localStorageKeys.ACCESS_TOKEN);
				localStorage.removeItem(localStorageKeys.REFRESH_TOKEN);

				set({
					user: null,
					accessToken: null,
					refreshToken: null,
					isAuthenticated: false,
					vendorContext: null,
				});
			},
			setUser: (user) => {
				set({ user });
			},
			setTokens: (accessToken, refreshToken) => {
				set({ accessToken, refreshToken });
			},
			setVendorContext: (ctx) => {
				set({ vendorContext: ctx });
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
			hasFeature: (feature) => {
				const ctx = get().vendorContext;
				return ctx?.enabled_features?.includes(feature) ?? false;
			},
			canAccessInventory: () => {
				const { user, vendorContext } = get();
				if (!user) return false;
				if (user.is_superuser) return true;
				if (vendorContext?.is_vendor_owner) return true;
				return (
					(user.permissions?.includes("manage_inventory") ?? false) &&
					(vendorContext?.enabled_features?.includes("inventory") ?? false)
				);
			},
			canAccessExpenses: () => {
				const { user, vendorContext } = get();
				if (!user) return false;
				if (user.is_superuser) return true;
				if (vendorContext?.is_vendor_owner) return true;
				return user.permissions?.includes("manage_expenses") ?? false;
			},
		}),
		{
			name: "auth-storage",
			partialize: (state) => ({
				user: state.user,
				accessToken: state.accessToken,
				refreshToken: state.refreshToken,
				isAuthenticated: state.isAuthenticated,
				vendorContext: state.vendorContext,
			}),
		}
	)
);
