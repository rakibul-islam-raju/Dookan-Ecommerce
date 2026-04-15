import type { ICommonFilter } from "./Common.type";

export interface WishlistUser {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
}

export interface WishlistProduct {
	id: string;
	name: string;
	slug: string;
	base_price: string;
	is_active: boolean;
	is_in_stock: boolean;
	primary_image: string | null;
	category: {
		id: string;
		name: string;
		slug: string;
	} | null;
}

export interface WishlistItem {
	id: string;
	user: WishlistUser;
	product: WishlistProduct;
	created_at: string;
}

export interface WishlistFilter extends ICommonFilter {
	search?: string;
	date_from?: string;
	date_to?: string;
}
