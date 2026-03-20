export interface IReviewUser {
	id: string;
	first_name: string;
	last_name: string;
}

export interface IProductReview {
	id: string;
	product: string;
	product_name: string;
	user: IReviewUser;
	rating: number;
	title: string;
	comment: string;
	is_approved: boolean;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface IReviewSummary {
	average_rating: number;
	review_count: number;
}

export interface ICreateReviewData {
	product: string;
	rating: number;
	title?: string;
	comment?: string;
}
