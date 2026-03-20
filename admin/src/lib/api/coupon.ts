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

export interface CouponListItem extends BaseModel {
	code: string;
	description: string;
	discount_type: "percentage" | "fixed_amount";
	discount_value: string;
	min_order_amount: string;
	max_discount_amount: string | null;
	max_uses: number | null;
	max_uses_per_user: number | null;
	used_count: number;
	valid_from: string;
	valid_until: string;
	is_valid: boolean;
}

export interface CouponCreateData {
	code: string;
	description?: string;
	discount_type: "percentage" | "fixed_amount";
	discount_value: number;
	min_order_amount?: number;
	max_discount_amount?: number | null;
	max_uses?: number | null;
	max_uses_per_user?: number | null;
	valid_from: string;
	valid_until: string;
	is_active?: boolean;
}

export interface CouponUpdateData extends Partial<CouponCreateData> {}

export interface CouponFilter extends ICommonFilter {
	search?: string;
	discount_type?: string;
	is_active?: boolean;
}

export const couponApi = {
	async list(
		params: CouponFilter
	): Promise<IPaginatedResponse<CouponListItem>> {
		const { data } = await clientApi.get<IPaginatedResponse<CouponListItem>>(
			"/coupons/",
			{ params }
		);
		return data;
	},

	async create(couponData: CouponCreateData): Promise<CouponListItem> {
		const { data } = await clientApi.post<CouponListItem>(
			"/coupons/",
			couponData
		);
		return data;
	},

	async update(
		id: string,
		updateData: CouponUpdateData
	): Promise<CouponListItem> {
		const { data } = await clientApi.patch<CouponListItem>(
			`/coupons/${id}/`,
			updateData
		);
		return data;
	},

	async delete(id: string): Promise<void> {
		await clientApi.delete(`/coupons/${id}/`);
	},
};

export const getCoupons = (params: CouponFilter) =>
	queryOptions({
		queryKey: [queryKeys.coupons, { params }],
		queryFn: async () => couponApi.list(params),
	});

export const useCreateCoupon = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CouponCreateData) => couponApi.create(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.coupons] });
		},
	});
};

export const useUpdateCoupon = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, updateData }: { id: string; updateData: CouponUpdateData }) =>
			couponApi.update(id, updateData),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.coupons] });
		},
	});
};

export const useDeleteCoupon = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => couponApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [queryKeys.coupons] });
		},
	});
};
