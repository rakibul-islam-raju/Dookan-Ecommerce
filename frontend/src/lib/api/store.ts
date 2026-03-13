/**
 * Store API Service
 * Handles site config and banner API calls
 * Supports both Server-Side (SSR/ISR) and Client-Side requests
 */

import type { IPaginatedResponse } from "@/@types/Common";
import type { IBanner, ISiteConfig } from "@/@types/Store";
import { clientApi, serverApi } from "./axios";

/**
 * Store API for Server Components (SSR/ISR)
 */
export const storeServerApi = {
	/**
	 * Get site configuration
	 * Use in Server Components with ISR
	 */
	async getSiteConfig(): Promise<ISiteConfig> {
		const { data } = await serverApi.get<ISiteConfig>("/store/config/");
		return data;
	},

	/**
	 * Get active banners
	 * Use in Server Components with ISR
	 */
	async getBanners(): Promise<IBanner[]> {
		const { data } = await serverApi.get<IPaginatedResponse<IBanner>>(
			"/store/banners/"
		);
		return data.results;
	},
};

/**
 * Store API for Client Components (CSR)
 */
export const storeClientApi = {
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
