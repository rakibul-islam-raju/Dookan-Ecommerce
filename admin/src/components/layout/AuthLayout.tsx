import { useAuthStore } from "@/store/useAuthStore";
import { Navigate, Outlet } from "react-router-dom";

export function AuthLayout() {
	const { user } = useAuthStore();

	if (user) {
		return <Navigate to="/" />;
	}

	return (
		<div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
			<div className="w-full max-w-sm">
				<img
					src="/images/dookan.jpg"
					alt="Dookan"
					className="w-32 h-32 mx-auto mb-4 rounded-lg"
				/>
				<Outlet />
			</div>
		</div>
	);
}
