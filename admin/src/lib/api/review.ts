import type { ReviewListItem } from "@/@types/Review";
import type { ICommonFilter, IPaginatedResponse } from "@/@types/Common.type";
import { queryKeys } from "@/constants/queryKeys";
import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { clientApi } from "./axios";

export interface ReviewFilter extends ICommonFilter {
	search?: string;
	is_approved?: boolean;
	rating?: number;
	user?: string;
}

export const reviewApi = {
	async list(
		params: ReviewFilter
	): Promise<IPaginatedResponse<ReviewListItem>> {
		const { data } = await clientApi.get<
			IPaginatedResponse<ReviewListItem>
		>("/products/reviews/admin/", { params });
		return data;
	},

	async updateStatus(
		id: string,
		is_approved: boolean
	): Promise<ReviewListItem> {
		const { data } = await clientApi.patch<ReviewListItem>(
			`/products/reviews/${id}/status/`,
			{ is_approved }
		);
		return data;
	},

	async delete(id: string): Promise<void> {
		await clientApi.delete(`/products/reviews/${id}/`);
	},
};

export const getReviews = (params: ReviewFilter) =>
	queryOptions({
		queryKey: [queryKeys.reviews, { params }],
		queryFn: async () => reviewApi.list(params),
	});

export const useUpdateReviewStatus = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			is_approved,
		}: {
			id: string;
			is_approved: boolean;
		}) => reviewApi.updateStatus(id, is_approved),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.reviews],
			});
		},
	});
};

export const useDeleteReview = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => reviewApi.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: [queryKeys.reviews],
			});
		},
	});
};
