/**
 * Product API Service
 * Handles all product-related API calls
 * Supports both Server-Side (SSR/ISR) and Client-Side requests
 */

import type { IPaginatedResponse, IPagination } from "@/@types/Common";
import type {
	IConsumerProductDetail,
	IConsumerProductListItem,
} from "@/@types/Product";
import { clientApi, serverApi } from "./axios";

export interface IProductFilter extends IPagination {
	category?: string;
	is_featured?: boolean;
	ordering?: "price" | "-price" | "created_at" | "-created_at";
	is_active?: boolean;
	is_in_stock?: boolean;
	min_price?: number;
	max_price?: number;
}

/**
 * Product API for Server Components (SSR/ISR)
 */
export const productServerApi = {
	/**
	 * Get paginated list of products
	 * Use in Server Components with ISR
	 */
	async getProducts(
		params: IProductFilter = {}
	): Promise<IPaginatedResponse<IConsumerProductListItem>> {
		const { data } = await serverApi.get<
			IPaginatedResponse<IConsumerProductListItem>
		>("/products/", { params: { ...params, is_active: true } });
		return data;
	},

	/**
	 * Get single product by slug
	 * Use in Server Components with ISR
	 */
	async getProductBySlug(slug: string): Promise<IConsumerProductDetail> {
		const { data } = await serverApi.get<IConsumerProductDetail>(
			`/products/slug/${slug}/`
		);
		return data;
	},

	/**
	 * Get featured products
	 */
	async getFeaturedProducts(): Promise<IConsumerProductListItem[]> {
		const { data } = await serverApi.get<
			IPaginatedResponse<IConsumerProductListItem>
		>("/products/", {
			params: { is_featured: true, page_size: 8 },
		});
		return data.results;
	},

	/**
	 * Get new arrivals (ordered by created_at descending)
	 */
	async getNewArrivals(): Promise<IConsumerProductListItem[]> {
		const { data } = await serverApi.get<
			IPaginatedResponse<IConsumerProductListItem>
		>("/products/", {
			params: { ordering: "-created_at", page_size: 8 },
		});
		return data.results;
	},

	/**
	 * Get products by category
	 */
	async getProductsByCategory(
		categorySlug: string,
		params?: { page?: number; page_size?: number }
	): Promise<IPaginatedResponse<IConsumerProductListItem>> {
		const { data } = await serverApi.get<
			IPaginatedResponse<IConsumerProductListItem>
		>("/products/", {
			params: { ...params, category: categorySlug },
		});
		return data;
	},
};

export interface IProductClientFilter {
	page?: number;
	page_size?: number;
	category?: string;
	search?: string;
	is_featured?: boolean;
	ordering?: "price" | "-price" | "created_at" | "-created_at";
	is_in_stock?: boolean;
	min_price?: number;
	max_price?: number;
}

/**
 * Product API for Client Components (CSR)
 */
export const productClientApi = {
	/**
	 * Get paginated list of products
	 * Use in Client Components with TanStack Query
	 */
	async getProducts(
		params?: IProductClientFilter
	): Promise<IPaginatedResponse<IConsumerProductListItem>> {
		const { data } = await clientApi.get<
			IPaginatedResponse<IConsumerProductListItem>
		>("/products/", { params: { ...params, is_active: true } });
		return data;
	},

	/**
	 * Get single product by slug
	 */
	async getProductBySlug(slug: string): Promise<IConsumerProductDetail> {
		const { data } = await clientApi.get<IConsumerProductDetail>(
			`/products/${slug}/`
		);
		return data;
	},

	/**
	 * Search products
	 */
	async searchProducts(
		query: string,
		params?: { page?: number; page_size?: number }
	): Promise<IPaginatedResponse<IConsumerProductListItem>> {
		const { data } = await clientApi.get<
			IPaginatedResponse<IConsumerProductListItem>
		>("/products/", {
			params: { ...params, search: query },
		});
		return data;
	},
};
