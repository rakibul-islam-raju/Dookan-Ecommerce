/**
 * React Query Hooks for Store (Banners)
 * Site config is now fetched server-side via ISR - use useSiteConfigContext() instead
 *
 * Client-side data fetching with caching and revalidation
 */

"use client";

import type { IBanner, ISiteConfig } from "@/@types/Store";
import { storeClientApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

/**
 * Query Keys for Store
 */
export const storeKeys = {
	all: ["store"] as const,
	banners: () => [...storeKeys.all, "banners"] as const,
	siteConfig: () => [...storeKeys.all, "siteConfig"] as const,
};

/**
 * Hook to fetch site configuration (client-side)
 * Provides shipping charges, tax rate, and free shipping threshold for checkout.
 */
export function useSiteConfig() {
	return useQuery<ISiteConfig>({
		queryKey: storeKeys.siteConfig(),
		queryFn: () => storeClientApi.getSiteConfig(),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook to fetch active banners
 */
export function useBanners() {
	return useQuery<IBanner[]>({
		queryKey: storeKeys.banners(),
		queryFn: () => storeClientApi.getBanners(),
		staleTime: 10 * 60 * 1000, // 10 minutes
	});
}
