import { ICategory } from "./Category";

export interface IProductImage {
	id: string;
	product: string;
	image: string;
	alt_text: string;
	is_primary: boolean;
	display_order: number;
}

export interface IConsumerProductListItem {
	id: string;
	name: string;
	slug: string;
	short_description?: string;
	category: {
		id: string;
		name: string;
		slug: string;
	};
	price: number;
	compare_at_price?: number;
	discount_percentage?: number;
	stock_quantity: number;
	is_low_stock: boolean;
	is_in_stock: boolean;
	unit: string;
	unit_value: number;
	is_featured: boolean;
	is_active: boolean;
	primary_image?: string;
}

export interface IConsumerProductDetail {
	id: string;
	name: string;
	slug: string;
	sku: string;
	description?: string;
	short_description?: string;
	category: ICategory;
	price: string;
	compare_at_price?: string;
	discount_percentage: number;
	stock_quantity: number;
	is_low_stock: boolean;
	is_in_stock: boolean;
	weight: string;
	unit: string;
	unit_value: string;
	is_featured: boolean;
	is_active: boolean;
	meta_title?: string;
	meta_description?: string;
	images: IProductImage[];
}
