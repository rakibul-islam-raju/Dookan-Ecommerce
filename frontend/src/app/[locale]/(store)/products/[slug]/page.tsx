import { store } from "@/config/store";
import type { AppLocale } from "@/i18n/routing";
import { getAbsoluteLocaleUrl, buildLocalizedMetadata } from "@/lib/seo";
import { getErrorMessage } from "@/lib/api/axios";
import { productServerApi } from "@/lib/api/products";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailsClient } from "./_components/ProductDetailsClient";

interface ProductPageProps {
	params: Promise<{ locale: AppLocale; slug: string }>;
}

export async function generateMetadata({
	params,
}: ProductPageProps): Promise<Metadata> {
	const { locale, slug } = await params;

	try {
		const product = await productServerApi.getProductBySlug(slug);
		const price = parseFloat(product.sale_price ?? product.base_price);
		const primaryImage =
			product.images.find((img) => img.is_primary)?.image ||
			product.images[0]?.image ||
			`${store.url}/og-image.jpg`;
		const title = product.meta_title || product.name;
		const description =
			product.meta_description ||
			product.short_description ||
			product.description ||
			(locale === "bn"
				? `${product.name} কিনুন ${store.title} থেকে`
				: `Buy ${product.name} from ${store.title}`);

		return {
			...buildLocalizedMetadata({
				locale,
				pathname: `/products/${product.slug}`,
				title,
				description,
				keywords: [
					product.name,
					product.category.name,
					locale === "bn" ? "অর্গানিক পণ্য" : "organic products",
					locale === "bn" ? "অনলাইনে কিনুন" : "buy online",
					store.title,
				],
				images: [
					{
						url: primaryImage,
						width: 1200,
						height: 630,
						alt: product.name,
					},
				],
			}),
			other: {
				"product:price:amount": price,
				"product:price:currency": "BDT",
				"product:availability": product.is_in_stock
					? "in stock"
					: "out of stock",
				"product:condition": "new",
				"og:locale:alternate":
					locale === "bn" ? "en_US" : "bn_BD",
				"og:url": getAbsoluteLocaleUrl(locale, `/products/${product.slug}`),
			},
		};
	} catch (error) {
		console.error("Failed to generate product metadata:", getErrorMessage(error));
		return buildLocalizedMetadata({
			locale,
			pathname: `/products/${slug}`,
			title: locale === "bn" ? `পণ্য | ${store.title}` : `Product | ${store.title}`,
			description: store.description,
		});
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

	if (!product.is_active) {
		notFound();
	}

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
			price: product.sale_price ?? product.base_price,
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
