import { BannerCarousel } from "@/components/BannerCarousel";
import { store } from "@/config/store";
import { getPageMetadataCopy } from "@/i18n/page-metadata";
import type { AppLocale } from "@/i18n/routing";
import { storeServerApi } from "@/lib/api";
import { buildLocalizedMetadata } from "@/lib/seo";
import { CategorySlider } from "./_components/CategorySlider";
import { Featured } from "./_components/Featured";
import { Hero } from "./_components/Hero";
import { NewArrivals } from "./_components/NewArrivals";

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

export default async function HomePage() {
	let banners: Awaited<ReturnType<typeof storeServerApi.getBannersCached>> = [];
	try {
		banners = await storeServerApi.getBannersCached();
	} catch (error) {
		console.error("Failed to fetch banners:", error);
	}

	const activeBanners = banners.filter((banner) => banner.is_active);

	const organizationSchema = {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: store.title,
		description: store.description,
		url: store.url,
		logo: `${store.url}/logo.png`,
		contactPoint: {
			"@type": "ContactPoint",
			telephone: store.phone,
			contactType: "customer service",
			email: store.email,
		},
		sameAs: [
			store.facebook,
			store.instagram,
			store.twitter,
			store.linkedin,
			store.youtube,
		].filter(Boolean),
		address: {
			"@type": "PostalAddress",
			streetAddress: store.address,
		},
	};

	const websiteSchema = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: store.title,
		description: store.description,
		url: store.url,
		potentialAction: {
			"@type": "SearchAction",
			target: {
				"@type": "EntryPoint",
				urlTemplate: `${store.url}/shop?search={search_term_string}`,
			},
			"query-input": "required name=search_term_string",
		},
	};

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(organizationSchema),
				}}
			/>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(websiteSchema),
				}}
			/>
			{activeBanners.length > 0 ? (
				<BannerCarousel banners={activeBanners} />
			) : (
				<Hero />
			)}
			<CategorySlider />
			<NewArrivals />
			<Featured />
		</>
	);
}
