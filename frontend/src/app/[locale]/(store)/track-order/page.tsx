import TrackOrderPage from "@/app/(store)/track-order/page";
import { getPageMetadataCopy } from "@/i18n/page-metadata";
import type { AppLocale } from "@/i18n/routing";
import { buildLocalizedMetadata } from "@/lib/seo";

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

export default TrackOrderPage;
