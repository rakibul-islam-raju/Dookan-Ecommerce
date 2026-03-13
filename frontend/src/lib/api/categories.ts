import { ICategory } from "@/@types/Category";
import { IPaginatedResponse } from "@/@types/Common";
import { clientApi, serverApi } from "./axios";

export const categoryServerApi = {
	/**
	 * Get all categories
	 */
	async getCategories(): Promise<IPaginatedResponse<ICategory>> {
		const { data } = await serverApi.get<IPaginatedResponse<ICategory>>(
			"/products/categories/"
		);
		return data;
	},

	/**
	 * Get single category by slug
	 */
	async getCategoryBySlug(slug: string): Promise<ICategory> {
		const { data } = await serverApi.get<ICategory>(
			`/products/categories/${slug}/`
		);
		return data;
	},
};

/**
 * Category API for Client Components (CSR)
 */
export const categoryClientApi = {
	/**
	 * Get all categories
	 */
	async getCategories(): Promise<IPaginatedResponse<ICategory>> {
		const { data } = await clientApi.get<IPaginatedResponse<ICategory>>(
			"/products/categories/"
		);
		return data;
	},

	/**
	 * Get single category by slug
	 */
	async getCategoryBySlug(slug: string): Promise<ICategory> {
		const { data } = await clientApi.get<ICategory>(
			`/products/categories/${slug}/`
		);
		return data;
	},
};
