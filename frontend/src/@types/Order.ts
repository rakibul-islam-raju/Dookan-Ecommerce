export type IOrderStatus =
	| "pending"
	| "processing"
	| "shipped"
	| "delivered"
	| "cancelled"
	| "returned";

// Response interface
export interface OrderListResponse {
	count: number;
	next: string | null;
	previous: string | null;
	results: OrderListItem[];
}

export type IOrderPaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderListItem {
	id: string;
	order_number: string;
	customer_name: string;
	status: IOrderStatus;
	payment_status: "pending" | "paid" | "failed" | "refunded";
	total_amount: string; // Decimal as string
	items_count: number; // Number of items in the order
	created_at: string; // ISO date string
}

// Order creation request interface
export interface ICreateOrderRequest {
	// Guest users only
	guest_mobile_number?: string;

	// Common fields
	customer_name: string;
	customer_email?: string;
	payment_method: "cod" | "online" | "card" | "upi";
	customer_note?: string;
	coupon_code?: string;

	// Order items
	items: IOrderItemRequest[];

	// Shipping address
	shipping_address: IOrderShippingAddressRequest;

	delivery_type: "inside_dhaka" | "outside_dhaka";
	meta_event_id?: string;
}

// Individual order item for creation
export interface IOrderItemRequest {
	product_id: string; // UUID
	variant_id: string; // UUID
	quantity: number;
}

// Shipping address for creation
export interface IOrderShippingAddressRequest {
	full_name: string;
	mobile_number: string;
	address_line1: string;
	address_line2?: string;
	city: string;
	state: string;
	postal_code: string;
	country?: string; // Defaults to "Bangladesh"
}

// Order creation response (detailed order info)
export interface IOrderResponse {
	id: string;
	order_number: string;
	customer_name: string;
	customer_email?: string;
	guest_mobile_number?: string;
	status: IOrderStatus;
	payment_status: IOrderPaymentStatus;
	payment_method: "cod" | "online" | "card" | "upi";
	coupon_code?: string;
	subtotal: string; // Decimal as string
	discount_amount: string;
	tax_amount: string;
	shipping_amount: string;
	total_amount: string;
	customer_note?: string;
	admin_note?: string;
	created_at: string;
	updated_at: string;
	confirmed_at?: string;
	shipped_at?: string;
	delivered_at?: string;

	// Related data
	items: IOrderItemResponse[];
	shipping_address: IOrderShippingAddressResponse;
	status_history?: IOrderStatusHistory[];
}

// Order item response
export interface IOrderItemResponse {
	id: string;
	product_name: string;
	product_sku: string;
	variant_name: string;
	variant_sku: string;
	unit_price: string;
	quantity: number;
	total_price: string;
	product_details: {
		id: string;
		name: string;
		slug: string;
		image?: string;
	};
}

// Shipping address response
export interface IOrderShippingAddressResponse {
	id: string;
	full_name: string;
	mobile_number: string;
	address_line1: string;
	address_line2?: string;
	city: string;
	state: string;
	postal_code: string;
	country: string;
}

// Order status history
export interface IOrderStatusHistory {
	id: string;
	status: string;
	note?: string;
	created_at: string;
	created_by?: {
		id: string;
		username: string;
		email: string;
	};
}

export interface IMyOrderListItem {
	id: string;
	order_number: string;
	customer_name: string;
	status: IOrderStatus;
	payment_status: IOrderPaymentStatus;
	total_amount: string;
	items_count: number;
	created_at: string;
}
