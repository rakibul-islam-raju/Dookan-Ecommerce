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
	base_price: string;
	sale_price: string | null;
	sale_discount_percentage: number;
	stock_quantity: number;
	is_in_stock: boolean;
	is_low_stock: boolean;
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
	base_price: number;
	sale_price: number | null;
	sale_discount_percentage: number;
	sale_name?: string;
	stock_quantity: number;
	is_low_stock: boolean;
	is_in_stock: boolean;
	unit: string;
	unit_value: number;
	is_featured: boolean;
	is_active: boolean;
	primary_image?: string;
	has_variants: boolean;
	min_variant_base_price?: string | null;
}

export interface IConsumerProductDetail {
	id: string;
	name: string;
	slug: string;
	sku: string;
	description?: string;
	short_description?: string;
	category: ICategory;
	base_price: string;
	sale_price: string | null;
	sale_discount_percentage: number;
	sale_name?: string;
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
