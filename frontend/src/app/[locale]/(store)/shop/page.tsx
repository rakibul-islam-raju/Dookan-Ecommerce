import { getPageMetadataCopy } from "@/i18n/page-metadata";
import type { AppLocale } from "@/i18n/routing";
import { buildLocalizedMetadata } from "@/lib/seo";
import { Suspense } from "react";
import { ShopContent } from "./_components/ShopContent";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: AppLocale }>;
}) {
	const { locale } = await params;
	const copy = getPageMetadataCopy(locale, "shop");

	return buildLocalizedMetadata({
		locale,
		pathname: "/shop",
		title: copy.title,
		description: copy.description,
		keywords: copy.keywords,
	});
}

export default function ShopPage() {
	return (
		<Suspense>
			<ShopContent />
		</Suspense>
	);
}
