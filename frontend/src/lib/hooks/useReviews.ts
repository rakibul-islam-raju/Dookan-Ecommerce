"use client";

import type { IPaginatedResponse } from "@/@types/Common";
import type { ICreateReviewData, IProductReview } from "@/@types/Review";
import { reviewClientApi } from "@/lib/api/reviews";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const reviewKeys = {
	all: ["reviews"] as const,
	product: (productId: string) => [...reviewKeys.all, productId] as const,
};

export function useProductReviews(productId: string) {
	return useQuery<IPaginatedResponse<IProductReview>>({
		queryKey: reviewKeys.product(productId),
		queryFn: () => reviewClientApi.getProductReviews(productId),
		enabled: !!productId,
	});
}

export function useCreateReview() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: ICreateReviewData) =>
			reviewClientApi.createReview(data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({
				queryKey: reviewKeys.product(variables.product),
			});
		},
	});
}
