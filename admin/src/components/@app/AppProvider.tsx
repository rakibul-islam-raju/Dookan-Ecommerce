import { Toaster } from "@/components/ui/sonner";
import { userApi } from "@/lib/api/user";
import { router } from "@/routes";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useTransition } from "react";
import { RouterProvider } from "react-router-dom";
import AppLoader from "./AppLoader";
import ToastProvider from "../providers/toast-provider";

export const AppProvider = () => {
	const setUser = useAuthStore((state) => state.setUser);
	const logout = useAuthStore((state) => state.logout);
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const [isPending, startTransition] = useTransition();


	useEffect(() => {
		// fetch me info
		const fetchMeInfo = async () => {
			startTransition(async () => {
				try {
					const data = await userApi.getMeInfo();
					if (data.id) {
						setUser(data);
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
	}, [isAuthenticated, setUser, logout]);

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
