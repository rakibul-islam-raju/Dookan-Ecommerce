import MaintenancePage from "@/app/maintenance/page";
import { getPageMetadataCopy } from "@/i18n/page-metadata";
import type { AppLocale } from "@/i18n/routing";
import { buildLocalizedMetadata } from "@/lib/seo";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: AppLocale }>;
}) {
	const { locale } = await params;
	const copy = getPageMetadataCopy(locale, "maintenance");

	return buildLocalizedMetadata({
		locale,
		pathname: "/maintenance",
		title: copy.title,
		description: copy.description,
	});
}

export default MaintenancePage;
