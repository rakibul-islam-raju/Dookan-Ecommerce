import type { IPaginatedResponse } from "@/@types/Common";
import type { ICreateReviewData, IProductReview } from "@/@types/Review";
import { clientApi, serverApi } from "./axios";

export const reviewServerApi = {
	async getProductReviews(
		productId: string
	): Promise<IPaginatedResponse<IProductReview>> {
		const { data } = await serverApi.get<IPaginatedResponse<IProductReview>>(
			`/products/${productId}/reviews/`
		);
		return data;
	},
};

export const reviewClientApi = {
	async getProductReviews(
		productId: string
	): Promise<IPaginatedResponse<IProductReview>> {
		const { data } = await clientApi.get<IPaginatedResponse<IProductReview>>(
			`/products/${productId}/reviews/`
		);
		return data;
	},

	async createReview(reviewData: ICreateReviewData): Promise<IProductReview> {
		const { data } = await clientApi.post<IProductReview>(
			"/products/reviews/",
			reviewData
		);
		return data;
	},
};
