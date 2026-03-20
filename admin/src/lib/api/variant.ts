import { queryKeys } from "@/constants/queryKeys";
import { queryOptions, useMutation } from "@tanstack/react-query";
import { queryClient } from "../react-query";
import { clientApi } from "./axios";

// ============================================================
// Types
// ============================================================

export interface VariantOption {
	id: string;
	value: string;
	display_order: number;
}

export interface VariantType {
	id: string;
	name: string;
	display_order: number;
	options: VariantOption[];
}

export interface CreateVariantTypeRequest {
	name: string;
	display_order?: number;
	options?: { value: string; display_order?: number }[];
}

export interface ProductVariantOption {
	id: string;
	variant_type_id: string;
	variant_type_name: string;
	value: string;
}

export interface ProductVariant {
	id: string;
	product: string;
	sku: string;
	name: string;
	price: string;
	compare_at_price?: string | null;
	cost_price?: string | null;
	stock_quantity: number;
	low_stock_threshold: number;
	weight?: string | null;
	is_active: boolean;
	is_in_stock: boolean;
	is_low_stock: boolean;
	discount_percentage: number;
	display_order: number;
	options: ProductVariantOption[];
}

export interface CreateProductVariantRequest {
	sku: string;
	name?: string;
	price: string;
	compare_at_price?: string | null;
	cost_price?: string | null;
	stock_quantity?: number;
	low_stock_threshold?: number;
	weight?: string | null;
	is_active?: boolean;
	display_order?: number;
	option_ids?: string[];
}

// ============================================================
// API Methods
// ============================================================

export const variantApi = {
	// Variant Types
	async listVariantTypes(): Promise<VariantType[]> {
		const { data } = await clientApi.get<VariantType[]>(
			"/products/variant-types/"
		);
		return data;
	},
	async getVariantType(id: string): Promise<VariantType> {
		const { data } = await clientApi.get<VariantType>(
			`/products/variant-types/${id}/`
		);
		return data;
	},
	async createVariantType(
		payload: CreateVariantTypeRequest
	): Promise<VariantType> {
		const { data } = await clientApi.post<VariantType>(
			"/products/variant-types/",
			payload
		);
		return data;
	},
	async updateVariantType(
		id: string,
		payload: Partial<CreateVariantTypeRequest>
	): Promise<VariantType> {
		const { data } = await clientApi.patch<VariantType>(
			`/products/variant-types/${id}/`,
			payload
		);
		return data;
	},
	async deleteVariantType(id: string): Promise<void> {
		await clientApi.delete(`/products/variant-types/${id}/`);
	},

	// Product Variants
	async listProductVariants(productId: string): Promise<ProductVariant[]> {
		const { data } = await clientApi.get<ProductVariant[]>(
			`/products/${productId}/variants/`
		);
		return data;
	},
	async createProductVariant(
		productId: string,
		payload: CreateProductVariantRequest
	): Promise<ProductVariant> {
		const { data } = await clientApi.post<ProductVariant>(
			`/products/${productId}/variants/`,
			payload
		);
		return data;
	},
	async updateProductVariant(
		variantId: string,
		payload: Partial<CreateProductVariantRequest>
	): Promise<ProductVariant> {
		const { data } = await clientApi.patch<ProductVariant>(
			`/products/variants/${variantId}/`,
			payload
		);
		return data;
	},
	async deleteProductVariant(variantId: string): Promise<void> {
		await clientApi.delete(`/products/variants/${variantId}/`);
	},
};

// ============================================================
// React Query Hooks
// ============================================================

export const getVariantTypes = () =>
	queryOptions({
		queryKey: [queryKeys.variantTypes],
		queryFn: () => variantApi.listVariantTypes(),
	});

export const getProductVariants = (productId: string) =>
	queryOptions({
		queryKey: [queryKeys.productVariants, productId],
		queryFn: () => variantApi.listProductVariants(productId),
		enabled: !!productId,
	});

export const useCreateVariantType = () =>
	useMutation({
		mutationFn: (data: CreateVariantTypeRequest) =>
			variantApi.createVariantType(data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.variantTypes],
			});
		},
	});

export const useUpdateVariantType = () =>
	useMutation({
		mutationFn: ({
			id,
			data,
		}: {
			id: string;
			data: Partial<CreateVariantTypeRequest>;
		}) => variantApi.updateVariantType(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.variantTypes],
			});
		},
	});

export const useDeleteVariantType = () =>
	useMutation({
		mutationFn: (id: string) => variantApi.deleteVariantType(id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.variantTypes],
			});
		},
	});

export const useCreateProductVariant = () =>
	useMutation({
		mutationFn: ({
			productId,
			data,
		}: {
			productId: string;
			data: CreateProductVariantRequest;
		}) => variantApi.createProductVariant(productId, data),
		onSuccess: (_, { productId }) => {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.productVariants, productId],
			});
			queryClient.invalidateQueries({
				queryKey: [queryKeys.productDetails, productId],
			});
		},
	});

export const useUpdateProductVariant = () =>
	useMutation({
		mutationFn: ({
			variantId,
			data,
		}: {
			variantId: string;
			data: Partial<CreateProductVariantRequest>;
		}) => variantApi.updateProductVariant(variantId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.productVariants],
			});
			queryClient.invalidateQueries({
				queryKey: [queryKeys.productDetails],
			});
		},
	});

export const useDeleteProductVariant = () =>
	useMutation({
		mutationFn: (variantId: string) =>
			variantApi.deleteProductVariant(variantId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.productVariants],
			});
			queryClient.invalidateQueries({
				queryKey: [queryKeys.productDetails],
			});
		},
	});
