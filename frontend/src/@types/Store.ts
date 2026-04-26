export interface ISiteConfig {
	id: string;
	name: string;
	tagline?: string;
	description?: string;
	logo?: string;
	favicon?: string;
	address?: string;
	phone?: string;
	email?: string;
	whatsapp?: string;
	facebook?: string;
	instagram?: string;
	twitter?: string;
	youtube?: string;
	linkedin?: string;
	storefront_enabled?: boolean;
	meta_pixel_enabled?: boolean;
	meta_pixel_id?: string;
	meta_default_currency?: string;
	// Shipping & Tax
	inside_dhaka_delivery_charge?: string;
	outside_dhaka_delivery_charge?: string;
	free_shipping_threshold?: string;
	tax_rate?: string;
}

export interface IAnnouncement {
	id: number;
	title: string;
	description: string;
	start_date: string;
	end_date: string;
	is_active: boolean;
}

export interface IBanner {
	id: string;
	title: string;
	description?: string;
	image: string;
	link?: string;
	is_active: boolean;
	display_order: number;
}
