import type { MetadataRoute } from "next";
import { store } from "@/config/store";
import { routing } from "@/i18n/routing";
import { productServerApi } from "@/lib/api/products";
import { getLocalizedRouteList, getAbsoluteLocaleUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const routes = routing.locales.flatMap((locale) =>
		getLocalizedRouteList().map((pathname) => {
			const changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] =
				pathname === "/" ? "daily" : "weekly";

			return {
				url: getAbsoluteLocaleUrl(locale, pathname),
				lastModified: new Date(),
				changeFrequency,
				priority: pathname === "/" ? 1 : 0.7,
			};
		}),
	);

	try {
		const products = await productServerApi.getProducts({ limit: 200 });
		const productRoutes = products.results.flatMap((product) =>
			routing.locales.map((locale) => ({
				url: getAbsoluteLocaleUrl(locale, `/products/${product.slug}`),
				lastModified: new Date(),
				changeFrequency: "weekly" as const,
				priority: 0.8,
			})),
		);

		return [...routes, ...productRoutes];
	} catch {
		return [
			...routes,
			{
				url: `${store.url}/bn`,
				lastModified: new Date(),
				changeFrequency: "daily" as const,
				priority: 1,
			},
		];
	}
}
