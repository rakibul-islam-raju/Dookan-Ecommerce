import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useAuthStore } from "@/store/useAuthStore";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useIntl } from "react-intl";

export function AuthLayout() {
	const { user } = useAuthStore();
	const location = useLocation();
	const intl = useIntl();
	const allowAuthenticatedAccess = location.pathname === "/set-password";

	if (user && !allowAuthenticatedAccess) {
		return <Navigate to="/" />;
	}

	return (
		<div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
			<div className="w-full max-w-sm">
				<div className="mb-4 flex justify-end">
					<LanguageSwitcher />
				</div>
				<img
					src="/images/dookan.jpg"
					alt={intl.formatMessage({
						id: "auth.logoAlt",
						defaultMessage: "Dookan logo",
					})}
					className="w-32 h-32 mx-auto mb-4 rounded-lg"
				/>
				<Outlet />
			</div>
		</div>
	);
}
