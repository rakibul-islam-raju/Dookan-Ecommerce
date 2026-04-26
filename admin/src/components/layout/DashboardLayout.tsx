import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { vendorApi } from "@/lib/api/vendor";
import { Navigate, Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

export function DashboardLayout() {
	const { user, vendorContext, setVendorContext } = useAuthStore();

	useEffect(() => {
		if (user && !vendorContext) {
			vendorApi.getContext().then(setVendorContext).catch(() => {});
		}
	}, [user, vendorContext, setVendorContext]);

	if (!user) {
		return <Navigate to="/login" />;
	}

	return (
		<div className="relative">
			<Header />
			<div className="flex w-full overflow-hidden">
				<Sidebar />
				<main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 overflow-y-auto md:ml-[260px]">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
