import { store } from "@/config/store";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { GuestOrderTracking } from "./_components/GuestOrderTracking";

export const metadata: Metadata = {
	title: `Track Order | ${store.title}`,
	description: `${store.title} - Track your guest orders`,
	keywords: ["track order", "guest order", "order tracking", `${store.title}`],
};

export default async function TrackOrderPage() {
	const t = await getTranslations("trackOrder");

	return (
		<div className="container mx-auto py-10 px-4 max-w-md">
			<div className="space-y-6">
				<div className="space-y-2 text-center">
					<h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
					<p className="text-muted-foreground">
						{t("description")}
					</p>
				</div>
				<GuestOrderTracking />
			</div>
		</div>
	);
}
