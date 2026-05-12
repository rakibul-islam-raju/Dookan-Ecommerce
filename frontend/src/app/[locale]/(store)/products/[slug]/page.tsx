import { store } from "@/config/store";
import type { AppLocale } from "@/i18n/routing";
import { getAbsoluteLocaleUrl, buildLocalizedMetadata } from "@/lib/seo";
import { getErrorMessage } from "@/lib/api/axios";
import { productServerApi } from "@/lib/api/products";
import type { Metadata } from "next";
import ProductDetailsPage from "@/app/(store)/products/[slug]/page";

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

export default ProductDetailsPage;
