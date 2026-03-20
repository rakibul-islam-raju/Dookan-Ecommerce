import { ICategory } from "./Category";
import { IReviewSummary } from "./Review";

export interface IProductImage {
	id: string;
	product: string;
	image: string;
	alt_text: string;
	is_primary: boolean;
	display_order: number;
}

export interface IProductVariantOption {
	id: string;
	variant_type_id: string;
	variant_type_name: string;
	value: string;
}

export interface IProductVariant {
	id: string;
	sku: string;
	name: string;
	price: string;
	compare_at_price?: string;
	stock_quantity: number;
	is_in_stock: boolean;
	is_low_stock: boolean;
	discount_percentage: number;
	display_order: number;
	options: IProductVariantOption[];
}

export interface IProductVariantType {
	id: string;
	name: string;
	options: { id: string; value: string }[];
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
	has_variants: boolean;
	min_variant_price?: string | null;
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
	review_summary: IReviewSummary;
	has_variants: boolean;
	variants: IProductVariant[];
	variant_types: IProductVariantType[];
}
