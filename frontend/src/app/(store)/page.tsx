import { BannerCarousel } from "@/components/BannerCarousel";
import { store } from "@/config/store";
import { storeServerApi } from "@/lib/api";
import type { Metadata } from "next";
import { CategorySlider } from "./_components/CategorySlider";
import { Featured } from "./_components/Featured";
import { Hero } from "./_components/Hero";
import { NewArrivals } from "./_components/NewArrivals";

// Rich SEO Metadata
export const metadata: Metadata = {
	title: {
		default: store.title,
		template: `%s | ${store.title}`,
	},
	description: store.description,
	keywords: [
		...store.keywords.split(", "),
		"featured products",
		"organic food",
		"organic vegetables",
		"organic fruits",
		"premium organic products",
		"handpicked products",
		"best organic products",
	],
	authors: [{ name: store.author }],
	creator: store.author,
	publisher: store.author,
	metadataBase: new URL(store.url),
	alternates: {
		canonical: "/",
	},
	openGraph: {
		type: "website",
		locale: "en_US",
		url: store.url,
		title: store.title,
		description: store.description,
		siteName: store.title,
		images: [
			{
				url: `${store.url}/og-image.jpg`,
				width: 1200,
				height: 630,
				alt: store.title,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: store.title,
		description: store.description,
		creator: store.twitter
			? store.twitter.includes("@")
				? store.twitter
				: `@${store.twitter.split("/").pop()}`
			: undefined,
		images: [`${store.url}/og-image.jpg`],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	verification: {
		// Add your verification codes here when available
		// google: "your-google-verification-code",
		// yandex: "your-yandex-verification-code",
		// yahoo: "your-yahoo-verification-code",
	},
	category: "E-commerce",
};

export default async function Home() {
	// Fetch banners server-side with SSR
	let banners: Awaited<ReturnType<typeof storeServerApi.getBannersCached>> = [];
	try {
		banners = await storeServerApi.getBannersCached();
	} catch (error) {
		console.error("Failed to fetch banners:", error);
	}

	const activeBanners = banners.filter((b) => b.is_active);

	// Structured Data (JSON-LD) for SEO
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
			{/* Structured Data for SEO */}
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
