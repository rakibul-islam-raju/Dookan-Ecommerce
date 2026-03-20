export interface User {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
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
