import { getPageMetadataCopy } from "@/i18n/page-metadata";
import type { AppLocale } from "@/i18n/routing";
import { buildLocalizedMetadata } from "@/lib/seo";
import { getTranslations } from "next-intl/server";
import { GuestOrderTracking } from "./_components/GuestOrderTracking";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: AppLocale }>;
}) {
	const { locale } = await params;
	const copy = getPageMetadataCopy(locale, "trackOrder");

	return buildLocalizedMetadata({
		locale,
		pathname: "/track-order",
		title: copy.title,
		description: copy.description,
		keywords: ["order tracking", "guest order", "track order"],
	});
}

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
