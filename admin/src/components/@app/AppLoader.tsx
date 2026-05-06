import React from "react";
import { T } from "@/i18n/translate";
import { useT } from "@/i18n/use-t";

/**
 * AppLoader Component
 * Displays a loading screen during app initialization
 */
const AppLoader: React.FC = () => {
	const t = useT();

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
			<div className="flex flex-col items-center gap-6">
				<img
					src="/images/dookan.jpg"
					alt={t("auth.logoAlt", "Dookan logo") as string}
					className="w-40 h-40"
				/>
				<h1 className="text-3xl font-bold text-slate-800 mb-2">Dookan</h1>
				<p className="text-sm text-slate-500">
					<T id="app.brand.adminDashboard" defaultMessage="Admin Dashboard" />
				</p>

				<div className="relative">
					<div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
					<div className="absolute inset-0 flex items-center justify-center">
						<div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<span className="text-sm text-slate-600 font-medium">
						<T id="app.loading" defaultMessage="Loading" />
					</span>
					<div className="flex gap-1">
						<span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
						<span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
						<span className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AppLoader;
