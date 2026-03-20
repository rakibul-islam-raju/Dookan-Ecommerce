import { store } from "@/config/store";
import { getErrorMessage } from "@/lib/api/axios";
import { productServerApi } from "@/lib/api/products";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailsClient } from "./_components/ProductDetailsClient";

// ISR: Revalidate every hour
export const revalidate = 3600; // 1 hour in seconds

interface ProductPageProps {
	params: Promise<{ slug: string }>;
}

// Generate SEO Metadata
export async function generateMetadata({
	params,
}: ProductPageProps): Promise<Metadata> {
	const { slug } = await params;

	try {
		const product = await productServerApi.getProductBySlug(slug);

		const price = parseFloat(product.price);

		const primaryImage =
			product.images.find((img) => img.is_primary)?.image ||
			product.images[0]?.image ||
			`${store.url}/og-image.jpg`;

		const title = product.meta_title || product.name;
		const description =
			product.meta_description ||
			product.short_description ||
			product.description ||
			`Buy ${product.name} at ${store.title}`;

		return {
			title,
			description,
			keywords: [
				product.name,
				product.category.name,
				"organic products",
				"buy online",
				store.title,
			],
			authors: [{ name: store.author }],
			creator: store.author,
			publisher: store.author,
			metadataBase: new URL(store.url),
			alternates: {
				canonical: `/products/${product.slug}`,
			},
			openGraph: {
				type: "website",
				locale: "en_US",
				url: `${store.url}/products/${product.slug}`,
				title,
				description,
				siteName: store.title,
				images: [
					{
						url: primaryImage,
						width: 1200,
						height: 630,
						alt: product.name,
					},
				],
			},
			twitter: {
				card: "summary_large_image",
				title,
				description,
				images: [primaryImage],
			},
			robots: {
				index: product.is_active,
				follow: true,
				googleBot: {
					index: product.is_active,
					follow: true,
					"max-video-preview": -1,
					"max-image-preview": "large",
					"max-snippet": -1,
				},
			},
			other: {
				"product:price:amount": price,
				"product:price:currency": "BDT",
				"product:availability": product.is_in_stock
					? "in stock"
					: "out of stock",
				"product:condition": "new",
			},
		};
	} catch (error) {
		console.error("Failed to generate metadata:", getErrorMessage(error));
		return {
			title: `Product | ${store.title}`,
			description: store.description,
		};
	}
}

export default async function ProductDetailsPage({ params }: ProductPageProps) {
	const { slug } = await params;

	let product;
	try {
		product = await productServerApi.getProductBySlug(slug);
	} catch {
		notFound();
	}

	// Return 404 if product is not active
	if (!product.is_active) {
		notFound();
	}

	// Calculate future date for price validity (1 year from now)
	const futureDate = new Date();
	futureDate.setFullYear(futureDate.getFullYear() + 1);

	const productSchema = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: product.name,
		description: product.description || product.short_description,
		image: product.images.map((img) => img.image),
		sku: product.sku,
		brand: {
			"@type": "Brand",
			name: store.title,
		},
		offers: {
			"@type": "Offer",
			url: `${store.url}/products/${product.slug}`,
			priceCurrency: "BDT",
			price: product.price,
			priceValidUntil: futureDate.toISOString(),
			availability:
				product.is_in_stock === true
					? "https://schema.org/InStock"
					: "https://schema.org/OutOfStock",
			itemCondition: "https://schema.org/NewCondition",
		},
		...(product.review_summary?.review_count > 0 && {
			aggregateRating: {
				"@type": "AggregateRating",
				ratingValue: String(product.review_summary.average_rating),
				reviewCount: String(product.review_summary.review_count),
			},
		}),
		category: product.category.name,
	};

	return (
		<>
			{/* Structured Data for SEO */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(productSchema),
				}}
			/>
			<ProductDetailsClient product={product} />
		</>
	);
}
