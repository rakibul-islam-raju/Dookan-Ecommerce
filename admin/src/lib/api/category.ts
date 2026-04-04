/* eslint-disable @typescript-eslint/no-empty-object-type */
/**
 * Authentication API Service
 */

import { queryKeys } from "@/constants/queryKeys";
import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import type {
	BaseModel,
	ICommonFilter,
	IPaginatedResponse,
} from "../../@types/Common.type";
import { clientApi } from "./axios";

export interface CategoryChildItem {
	id: string;
	name: string;
	slug: string;
	image?: string;
	display_order: number;
	is_active: boolean;
}

export interface CategoryListItem extends BaseModel {
	name: string;
	slug: string;
	description?: string;
	image?: string;
	display_order: number;
	parent?: string | null;
	parent_name?: string | null;
	children?: CategoryChildItem[];
}

export interface CategoryListResponse
	extends IPaginatedResponse<CategoryListItem> {}

export interface CategoryCreateData {
	name: string;
	slug: string;
	description?: string;
	image?: File | null;
	display_order: number;
	is_active?: boolean;
	parent?: string | null;
}

export interface CategoryUpdateData extends Partial<CategoryCreateData> {}

export interface CategoryReorderItem {
	id: string;
	display_order: number;
}

export interface User {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
}

export interface CategoryFilter extends ICommonFilter {
	search?: string;
	is_active?: boolean;
}

/**
 * Authentication API (Client-side only)
 */
export const categoryApi = {
	/**
	 * List categories
	 */
	async list(params: CategoryFilter): Promise<CategoryListResponse> {
		const { data } = await clientApi.get<CategoryListResponse>(
			"/products/categories/",
			{
				params,
			}
		);
		return data;
	},
	/**
	 * Create new category
	 */
	async create(categoryData: CategoryCreateData): Promise<CategoryListItem> {
		const formData = buildCategoryFormData(categoryData);
		const { data } = await clientApi.post<CategoryListItem>(
			"/products/categories/",
			formData
		);
		return data;
	},

	/**
	 * Update category
	 */
	async update(
		id: string,
		updateData: CategoryUpdateData
	): Promise<CategoryListItem> {
		const formData = buildCategoryFormData(updateData);
		const { data } = await clientApi.patch<CategoryListItem>(
			`/products/categories/${id}/`,
			formData
		);
		return data;
	},

	/**
	 * Delete category
	 */
	async delete(id: string): Promise<void> {
		await clientApi.delete(`/products/categories/${id}/`);
	},

	async reorder(items: CategoryReorderItem[]): Promise<{ message: string }> {
		const { data } = await clientApi.post<{ message: string }>(
			"/products/categories/reorder/",
			{ items }
		);
		return data;
	},
};

function buildCategoryFormData(data: Partial<CategoryCreateData>): FormData {
	const formData = new FormData();
	if (data.name !== undefined) formData.append("name", data.name);
	if (data.slug !== undefined) formData.append("slug", data.slug);
	if (data.description !== undefined)
		formData.append("description", data.description);
	if (data.display_order !== undefined)
		formData.append("display_order", String(data.display_order));
	if (data.is_active !== undefined)
		formData.append("is_active", String(data.is_active));
	if (data.parent !== undefined) {
		formData.append("parent", data.parent || "");
	}
	if (data.image) formData.append("image", data.image);
	return formData;
}

export const getCategories = (params: CategoryFilter) =>
	queryOptions({
		queryKey: [queryKeys.categories, { params }],
		queryFn: async () => categoryApi.list(params),
	});

export const useCreateCategory = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (categoryData: CategoryCreateData) =>
			categoryApi.create(categoryData),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.categories],
			});
		},
	});
};

export const useUpdateCategory = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			updateData,
		}: {
			id: string;
			updateData: CategoryUpdateData;
		}) => categoryApi.update(id, updateData),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.categories],
			});
		},
	});
};

export const useDeleteCategory = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => categoryApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.categories],
			});
		},
	});
};

export const useReorderCategories = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (items: CategoryReorderItem[]) => categoryApi.reorder(items),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.categories],
			});
		},
	});
};
