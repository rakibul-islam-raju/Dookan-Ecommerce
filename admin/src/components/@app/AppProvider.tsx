import { Toaster } from "@/components/ui/sonner";
import { userApi } from "@/lib/api/user";
import { router } from "@/routes";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useTransition } from "react";
import { RouterProvider } from "react-router-dom";
import AppLoader from "./AppLoader";
import ToastProvider from "../providers/toast-provider";
import type { IVendorContext } from "@/@types/User.type";

export const AppProvider = () => {
	const setUser = useAuthStore((state) => state.setUser);
	const setVendorContext = useAuthStore((state) => state.setVendorContext);
	const logout = useAuthStore((state) => state.logout);
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		const fetchMeInfo = async () => {
			startTransition(async () => {
				try {
					const data = await userApi.getMeInfo();
					if (data.id) {
						setUser(data);
						const vendorCtx: IVendorContext = {
							active_vendor: data.active_vendor ?? null,
							enabled_features: data.enabled_features ?? [],
							inventory_mode: data.inventory_mode ?? null,
							storefront_enabled: data.storefront_enabled ?? false,
							meta_pixel_enabled: data.meta_pixel_enabled ?? false,
							vendor_permissions: data.vendor_permissions ?? [],
							is_vendor_owner: data.is_vendor_owner ?? false,
						};
						setVendorContext(vendorCtx);
					} else {
						logout();
					}
				} catch (error) {
					console.error(error);
					logout();
				}
			});
		};

		if (isAuthenticated) {
			fetchMeInfo();
		}
	}, [isAuthenticated, setUser, setVendorContext, logout]);

	return isPending ? (
		<AppLoader />
	) : (
		<>
		<ToastProvider>
			<RouterProvider router={router} />
		</ToastProvider>

		<Toaster />
		</>
	);
};
