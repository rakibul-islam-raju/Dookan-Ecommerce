/**
 * Cart API Service
 */

import { clientApi } from "./axios";

export interface CartItem {
	id: string;
	product: {
		id: string;
		name: string;
		slug: string;
		price: number;       // effective price (sale_price if on sale, else base_price)
		base_price?: number; // original MRP — present only when item is on sale
		primary_image?: string;
	};
	variant?: {
		id: string;
		name: string;
		sku: string;
		price: number;
	} | null;
	quantity: number;
	subtotal: number;
}

export interface Cart {
	id: string;
	items: CartItem[];
	total_items: number;
	subtotal: number;
	total: number;
}

export interface AddToCartData {
	product_id: string;
	quantity: number;
}

export interface UpdateCartItemData {
	quantity: number;
}

/**
 * Cart API (Client-side only - requires authentication)
 */
export const cartApi = {
	/**
	 * Get user's cart
	 */
	async getCart(): Promise<Cart> {
		const { data } = await clientApi.get<Cart>("/cart/");
		return data;
	},

	/**
	 * Add item to cart
	 */
	async addToCart(item: AddToCartData): Promise<Cart> {
		const { data } = await clientApi.post<Cart>("/cart/items/", item);
		return data;
	},

	/**
	 * Update cart item quantity
	 */
	async updateCartItem(
		itemId: string,
		update: UpdateCartItemData
	): Promise<Cart> {
		const { data } = await clientApi.patch<Cart>(
			`/cart/items/${itemId}/`,
			update
		);
		return data;
	},

	/**
	 * Remove item from cart
	 */
	async removeFromCart(itemId: string): Promise<Cart> {
		const { data } = await clientApi.delete<Cart>(`/cart/items/${itemId}/`);
		return data;
	},

	/**
	 * Clear entire cart
	 */
	async clearCart(): Promise<void> {
		await clientApi.delete("/cart/clear/");
	},
};
