export interface ReviewListItem {
	id: string;
	product: string;
	product_name: string;
	user: {
		id: string;
		first_name: string;
		last_name: string;
	};
	rating: number;
	title: string;
	comment: string;
	is_approved: boolean;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}
