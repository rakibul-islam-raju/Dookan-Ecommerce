/**
 * React Query Hooks for Categories
 * Client-side data fetching with caching and revalidation
 */

"use client";

import type { ICategory } from "@/@types/Category";
import type { IPaginatedResponse } from "@/@types/Common";
import { categoryClientApi } from "@/lib/api/categories";
import { useQuery } from "@tanstack/react-query";

/**
 * Query Keys for Categories
 */
export const categoryKeys = {
	all: ["categories"] as const,
	lists: () => [...categoryKeys.all, "list"] as const,
	list: () => [...categoryKeys.lists()] as const,
	details: () => [...categoryKeys.all, "detail"] as const,
	detail: (slug: string) => [...categoryKeys.details(), slug] as const,
};

/**
 * Hook to fetch all categories
 */
export function useCategories() {
	return useQuery<IPaginatedResponse<ICategory>>({
		queryKey: categoryKeys.list(),
		queryFn: () => categoryClientApi.getCategories(),
		staleTime: 10 * 60 * 1000, // 10 minutes (categories change less frequently)
	});
}

/**
 * Hook to fetch single category by slug
 */
export function useCategory(slug: string) {
	return useQuery<ICategory>({
		queryKey: categoryKeys.detail(slug),
		queryFn: () => categoryClientApi.getCategoryBySlug(slug),
		enabled: !!slug,
		staleTime: 10 * 60 * 1000, // 10 minutes
	});
}

