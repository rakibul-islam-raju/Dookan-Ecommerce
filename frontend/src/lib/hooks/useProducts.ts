/**
 * React Query Hooks for Products
 * Client-side data fetching with caching and revalidation
 */

"use client";

import type { IPaginatedResponse } from "@/@types/Common";
import type {
	IConsumerProductDetail,
	IConsumerProductListItem,
} from "@/@types/Product";
import { IProductClientFilter, productClientApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

/**
 * Query Keys for Products
 */
export const productKeys = {
	all: ["products"] as const,
	lists: () => [...productKeys.all, "list"] as const,
	list: (filters: IProductClientFilter) =>
		[...productKeys.lists(), filters] as const,
	details: () => [...productKeys.all, "detail"] as const,
	detail: (slug: string) => [...productKeys.details(), slug] as const,
};

/**
 * Hook to fetch paginated products
 */
export function useProducts(params?: IProductClientFilter) {
	return useQuery<IPaginatedResponse<IConsumerProductListItem>>({
		queryKey: productKeys.list(params || {}),
		queryFn: () => productClientApi.getProducts(params),
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook to fetch single product by slug
 */
export function useProduct(slug: string) {
	return useQuery<IConsumerProductDetail>({
		queryKey: productKeys.detail(slug),
		queryFn: () => productClientApi.getProductBySlug(slug),
		enabled: !!slug,
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

/**
 * Hook to search products
 * Always fetches fresh data by setting staleTime to 0
 */
export function useProductSearch(
	query: string,
	params?: { page?: number; limit?: number },
) {
	return useQuery<IPaginatedResponse<IConsumerProductListItem>>({
		queryKey: productKeys.list({ ...params, search: query }),
		queryFn: () => productClientApi.searchProducts(query, params),
		enabled: query.length > 0,
		staleTime: 0, // Always fetch fresh data
		gcTime: 0, // Don't cache results
	});
}
