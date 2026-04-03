import { queryKeys } from "@/constants/queryKeys";
import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import type { BaseModel, IPaginatedResponse } from "../../@types/Common.type";
import { clientApi } from "./axios";

export type DiscountType = "percentage" | "fixed_amount";
export type AppliesTo = "all_products" | "specific_categories" | "specific_products";

export interface SaleListItem extends BaseModel {
	name: string;
	description: string;
	discount_type: DiscountType;
	discount_value: string;
	applies_to: AppliesTo;
	category_count: number;
	product_count: number;
	valid_from: string;
	valid_until: string;
	allow_coupon_stacking: boolean;
	is_currently_active: boolean;
}

export interface SaleDetail extends BaseModel {
	name: string;
	description: string;
	discount_type: DiscountType;
	discount_value: string;
	applies_to: AppliesTo;
	categories: string[];
	products: string[];
	valid_from: string;
	valid_until: string;
	allow_coupon_stacking: boolean;
	is_currently_active: boolean;
}

export interface SaleCreateData {
	name: string;
	description?: string;
	discount_type: DiscountType;
	discount_value: number;
	applies_to: AppliesTo;
	categories?: string[];
	products?: string[];
	valid_from: string;
	valid_until: string;
	allow_coupon_stacking?: boolean;
	is_active?: boolean;
}

export type SaleUpdateData = Partial<SaleCreateData>;

export interface SaleFilter {
	limit?: number;
	offset?: number;
}

export const saleApi = {
	async list(params?: SaleFilter): Promise<IPaginatedResponse<SaleListItem>> {
		const { data } = await clientApi.get<IPaginatedResponse<SaleListItem>>(
			"/sales/",
			{ params }
		);
		return data;
	},

	async get(id: string): Promise<SaleDetail> {
		const { data } = await clientApi.get<SaleDetail>(`/sales/${id}/`);
		return data;
	},

	async create(saleData: SaleCreateData): Promise<SaleDetail> {
		const { data } = await clientApi.post<SaleDetail>("/sales/", saleData);
		return data;
	},

	async update(id: string, updateData: SaleUpdateData): Promise<SaleDetail> {
		const { data } = await clientApi.patch<SaleDetail>(
			`/sales/${id}/`,
			updateData
		);
		return data;
	},

	async delete(id: string): Promise<void> {
		await clientApi.delete(`/sales/${id}/`);
	},
};

export const getSales = (params?: SaleFilter) =>
	queryOptions({
		queryKey: [queryKeys.sales, { params }],
		queryFn: () => saleApi.list(params),
	});

export const getSaleDetail = (id: string) =>
	queryOptions({
		queryKey: [queryKeys.sales, id],
		queryFn: () => saleApi.get(id),
		enabled: !!id,
	});

export const useCreateSale = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: SaleCreateData) => saleApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.sales] });
		},
	});
};

export const useUpdateSale = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, updateData }: { id: string; updateData: SaleUpdateData }) =>
			saleApi.update(id, updateData),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.sales] });
		},
	});
};

export const useDeleteSale = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => saleApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.sales] });
		},
	});
};
