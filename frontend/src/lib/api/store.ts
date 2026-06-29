/**
 * Store API Service
 * Handles site config and banner API calls
 * Supports both Server-Side (SSR/ISR) and Client-Side requests
 */

import type { IPaginatedResponse } from "@/@types/Common";
import type { IAnnouncement, IBanner, ISiteConfig } from "@/@types/Store";
import { unstable_cache } from "next/cache";
import { clientApi, serverApi } from "./axios";

export const STORE_CACHE_TAGS = {
	banners: "store:banners",
	siteConfig: "store:site-config",
} as const;

const getBannersUncached = async (): Promise<IBanner[]> => {
	const { data } = await serverApi.get<IPaginatedResponse<IBanner>>(
		"/store/banners/"
	);
	return data.results;
};

const getSiteConfigUncached = async (): Promise<ISiteConfig> => {
	const { data } = await serverApi.get<ISiteConfig>("/store/site-config/");
	return data;
};

/**
 * Store API for Server Components (SSR/ISR)
 */
export const storeServerApi = {
	/**
	 * Get site configuration
	 * Use in Server Components with ISR
	 */
	async getSiteConfig(): Promise<ISiteConfig> {
		return getSiteConfigUncached();
	},

	/**
	 * Get site configuration with explicit tag-based invalidation.
	 * Cache is invalidated via `revalidateTag(STORE_CACHE_TAGS.siteConfig)`.
	 */
	getSiteConfigCached: unstable_cache(
		async () => getSiteConfigUncached(),
		["storeServerApi.getSiteConfigCached"],
		{
			revalidate: 60 * 60 * 24 * 365,
			tags: [STORE_CACHE_TAGS.siteConfig],
		}
	),

	/**
	 * Get active banners
	 * Use in Server Components with ISR
	 */
	async getBanners(): Promise<IBanner[]> {
		return getBannersUncached();
	},

	/**
	 * Get banners with Next.js server-side caching.
	 * Cache is invalidated via `revalidateTag(STORE_CACHE_TAGS.banners)`.
	 */
	getBannersCached: unstable_cache(
		async () => getBannersUncached(),
		["storeServerApi.getBannersCached"],
		{
			revalidate: 60 * 60 * 24 * 365, // 1 year; admin triggers explicit revalidation
			tags: [STORE_CACHE_TAGS.banners],
		}
	),
};

/**
 * Store API for Client Components (CSR)
 */
export const storeClientApi = {
	/**
	 * Get active announcements for the announcement bar
	 */
	async getAnnouncements(): Promise<IAnnouncement[]> {
		const { data } = await clientApi.get<IPaginatedResponse<IAnnouncement>>(
			"/store/announcements/",
			{ params: { limit: 20 } }
		);
		return data.results;
	},
	/**
	 * Get site configuration
	 * Use in Client Components with TanStack Query
	 */
	async getSiteConfig(): Promise<ISiteConfig> {
		const { data } = await clientApi.get<ISiteConfig>("/store/site-config/");
		return data;
	},

	/**
	 * Get active banners
	 * Use in Client Components with TanStack Query
	 */
	async getBanners(): Promise<IBanner[]> {
		const { data } = await clientApi.get<IPaginatedResponse<IBanner>>(
			"/store/banners/"
		);
		return data.results;
	},
};
