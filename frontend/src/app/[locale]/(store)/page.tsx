import HomePage from "@/app/(store)/page";
import { getPageMetadataCopy } from "@/i18n/page-metadata";
import type { AppLocale } from "@/i18n/routing";
import { buildLocalizedMetadata } from "@/lib/seo";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: AppLocale }>;
}) {
	const { locale } = await params;
	const copy = getPageMetadataCopy(locale, "home");

	return buildLocalizedMetadata({
		locale,
		pathname: "/",
		title: copy.title,
		description: copy.description,
		keywords: copy.keywords,
	});
}

export default HomePage;
