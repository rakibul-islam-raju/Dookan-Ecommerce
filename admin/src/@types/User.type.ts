export type Permission =
	| "view_dashboard"
	| "manage_products"
	| "manage_orders"
	| "manage_customers"
	| "manage_categories"
	| "manage_coupons"
	| "manage_reviews"
	| "manage_banners"
	| "manage_announcements"
	| "manage_settings"
	| "manage_staff"
	| "manage_sales"
	| "manage_wishlists";

export interface User {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
	is_staff: boolean;
	is_superuser: boolean;
	permissions: Permission[];
	role_name: string | null;
}

export interface Role {
	id: string;
	name: string;
	description: string;
	permissions: Permission[];
	user_count: number;
	created_at: string;
	updated_at: string;
}

export interface StaffMember {
	id: string;
	first_name: string;
	last_name: string;
	email: string;
	mobile_number: string;
	is_active: boolean;
	is_superuser: boolean;
	role: string | null;
	role_name: string | null;
	created_at: string;
	updated_at: string;
}

export interface CustomerListItem {
	id: string;
	first_name: string;
	last_name: string;
	email: string;
	mobile_number: string;
	is_active: boolean;
	is_email_verified: boolean;
	is_mobile_verified: boolean;
	created_at: string;
	updated_at: string;
}

export interface CustomerDefaultAddress {
	id: string;
	user: string;
	full_name: string;
	mobile_number: string;
	address_line1: string;
	address_line2?: string;
	city: string;
	state: string;
	postal_code: string;
	country: string;
	is_default: boolean;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface CustomerDetails {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
	mobile_number: string;
	is_active: boolean;
	is_staff: boolean;
	is_superuser: boolean;
	is_email_verified: boolean;
	is_mobile_verified: boolean;
	created_at: string;
	updated_at: string;
	default_address: CustomerDefaultAddress | null;
}
