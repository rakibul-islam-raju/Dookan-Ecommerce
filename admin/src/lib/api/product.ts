import type {
	BaseModel,
	ICommonFilter,
	IPaginatedResponse,
} from "@/@types/Common.type";
import type { ProductVariant } from "./variant";
import { queryKeys } from "@/constants/queryKeys";
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryClient } from "../react-query";
import { clientApi } from "./axios";

export interface ProductCategory {
	id: string;
	name: string;
	slug: string;
}

export interface CreateProductRequest {
	name: string;
	slug?: string;
	sku: string;
	description?: string | null;
	short_description?: string | null;
	category: string;
	base_price: string;
	cost_price?: string | null;
	stock_quantity?: number;
	low_stock_threshold?: number;
	track_inventory?: boolean;
	weight?: string | null;
	unit?: "kg" | "g" | "l" | "ml" | "piece" | "pack";
	unit_value?: string;
	meta_title?: string | null;
	meta_description?: string | null;
	is_featured?: boolean;
	is_active?: boolean;
}

export interface ProductListItem extends BaseModel {
	name: string;
	slug: string;
	sku: string;
	description: string;
	short_description: string;
	category: ProductCategory;
	base_price: string;
	cost_price?: string;
	sale_price?: string | null;
	sale_discount_percentage?: number;
	sale_name?: string | null;
	stock_quantity?: number;
	low_stock_threshold?: number;
	track_inventory?: boolean;
	weight?: string;
	unit?: "kg" | "g" | "l" | "ml" | "piece" | "pack";
	unit_value?: string;
	meta_title?: string;
	meta_description?: string;
	is_featured?: boolean;
}

export interface ProductFilter extends ICommonFilter {
	search?: string;
	is_active?: boolean;
	is_featured?: boolean;
	category?: string;
	is_in_stock?: boolean;
	min_price?: number;
	max_price?: number;
	ordering?: string;
}

export interface Category {
	id: string;
	name: string;
	slug: string;
	description: string;
	is_active: boolean;
	display_order: number;
}

export interface ProductImage {
	id: string;
	product: string;
	image: string;
	alt_text: string;
	is_primary: boolean;
	display_order: number;
}

export interface ProductDetailsResponse {
	id: string;
	name: string;
	slug: string;
	sku: string;
	description: string;
	short_description: string;
	category: ProductCategory;
	base_price: string;
	cost_price: string;
	sale_price?: string | null;
	sale_discount_percentage?: number;
	sale_name?: string | null;
	stock_quantity: number;
	is_low_stock: boolean;
	is_in_stock: boolean;
	low_stock_threshold: number;
	weight: string;
	unit: "kg" | "g" | "l" | "ml" | "piece" | "pack";
	unit_value: string;
	is_featured: boolean;
	is_active: boolean;
	track_inventory: boolean;
	meta_title: string;
	meta_description: string;
	images: ProductImage[];
	variants: ProductVariant[];
}

export interface ProductImageUploadRequest {
	image: File;
	alt_text: string;
	is_primary: boolean;
	display_order: number;
}

export interface ProductBulkStatusResponse {
	message: string;
	updated_count: number;
}

export const productApi = {
	async list(
		params: ProductFilter
	): Promise<IPaginatedResponse<ProductListItem>> {
		const { data } = await clientApi.get<IPaginatedResponse<ProductListItem>>(
			"/products/",
			{
				params,
			}
		);
		return data;
	},
	async details(id: string): Promise<ProductDetailsResponse> {
		const { data } = await clientApi.get<ProductDetailsResponse>(
			`/products/${id}/`
		);
		return data;
	},
	async create(productData: CreateProductRequest): Promise<ProductListItem> {
		const { data } = await clientApi.post<ProductListItem>(
			"/products/",
			productData
		);
		return data;
	},
	async update(
		id: string,
		productData: Partial<CreateProductRequest>
	): Promise<ProductListItem> {
		const { data } = await clientApi.patch<ProductListItem>(
			`/products/${id}/`,
			productData
		);
		return data;
	},
	async delete(id: string): Promise<void> {
		await clientApi.delete<void>(`/products/${id}/`);
	},
	async updateBulkStatus(
		ids: string[],
		is_active: boolean
	): Promise<ProductBulkStatusResponse> {
		const { data } = await clientApi.patch<ProductBulkStatusResponse>(
			"/products/bulk-status/",
			{ ids, is_active }
		);
		return data;
	},
	async uploadImages(
		productId: string,
		images: ProductImageUploadRequest[]
	): Promise<ProductImage[]> {
		const formData = new FormData();

		images.forEach((imageData, index) => {
			// Use bracket notation for arrays - common format for DRF
			formData.append(`images[${index}]image`, imageData.image);
			formData.append(`images[${index}]alt_text`, imageData.alt_text);
			formData.append(
				`images[${index}]is_primary`,
				String(imageData.is_primary)
			);
			formData.append(
				`images[${index}]display_order`,
				String(imageData.display_order)
			);
		});

		const { data } = await clientApi.post<ProductImage[]>(
			`/products/${productId}/images/`,
			formData
		);
		return data;
	},
	async deleteImage(imageId: string): Promise<void> {
		await clientApi.delete<void>(`/products/images/${imageId}/`);
	},
};

export const getProducts = (params: ProductFilter) =>
	queryOptions({
		queryKey: [queryKeys.products, { ...params }],
		queryFn: () => productApi.list(params),
	});

export const useProductDetails = (id: string) =>
	queryOptions({
		queryKey: [queryKeys.productDetails, id],
		queryFn: () => productApi.details(id),
		enabled: !!id,
	});

export const useCreateProduct = () => {
	return useMutation({
		mutationFn: (productData: CreateProductRequest) =>
			productApi.create(productData),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.products] });
		},
	});
};

export const useUpdateProduct = () => {
	return useMutation({
		mutationFn: ({
			id,
			updateData,
		}: {
			id: string;
			updateData: Partial<CreateProductRequest>;
		}) => productApi.update(id, updateData),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.products] });
		},
	});
};

export const useDeleteProduct = () => {
	return useMutation({
		mutationFn: (id: string) => productApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.products] });
		},
	});
};

export const useBulkUpdateProductStatus = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			ids,
			is_active,
		}: {
			ids: string[];
			is_active: boolean;
		}) => productApi.updateBulkStatus(ids, is_active),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.products] });
			queryClient.invalidateQueries({ queryKey: [queryKeys.productDetails] });
		},
	});
};

export const useUploadImages = () => {
	return useMutation({
		mutationFn: ({
			productId,
			images,
		}: {
			productId: string;
			images: ProductImageUploadRequest[];
		}) => productApi.uploadImages(productId, images),
		onSuccess: (_, { productId }) => {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.productDetails, productId],
			});
		},
	});
};

export const useDeleteImage = () => {
	return useMutation({
		mutationFn: (imageId: string) => productApi.deleteImage(imageId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.productDetails] });
		},
	});
};
