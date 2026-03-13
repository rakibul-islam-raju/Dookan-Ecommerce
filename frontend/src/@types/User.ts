export interface IUserAddress {
	id: string;
	user: string;
	address_type: "home" | "work" | "other";
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

export interface ICreateUserAddressRequest {
	address_type: "home" | "work" | "other";
	full_name: string;
	mobile_number: string;
	address_line1: string;
	address_line2?: string;
	city: string;
	state: string;
	postal_code: string;
	country: string;
}

export interface IUpdateUserAddressRequest
	extends Partial<ICreateUserAddressRequest> {
	id: string;
	is_default?: boolean;
}
