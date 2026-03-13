/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cart Store using Zustand
 * Client-side cart management with local storage
 */

"use client";

import { type Cart, type CartItem } from "@/lib/api";
import { toast } from "react-toastify";
import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Export cart store for external use
 */
export { useCartStore };

/**
 * Local cart data structure (different from API's AddToCartData)
 * This accepts a full product object for client-side cart management
 */
export interface LocalAddToCartData {
	product: any; // Full product object
	quantity?: number;
}

/**
 * Cart Store Interface
 */
interface CartStore {
	cart: Cart;
	hydrated: boolean;
	addToCart: (data: LocalAddToCartData) => void;
	updateCartItem: (itemId: string, quantity: number) => void;
	removeFromCart: (itemId: string) => void;
	clearCart: () => void;
	getTotalItems: () => number;
	getSubtotal: () => number;
}

/**
 * Initial empty cart
 */
const initialCart: Cart = {
	id: "local-cart",
	items: [],
	total_items: 0,
	subtotal: 0,
	total: 0,
};

/**
 * Cart Store with Zustand
 */
const useCartStore = create<CartStore>()(
	persist(
		(set, get) => ({
			cart: initialCart,
			hydrated: false,

			addToCart: (data: LocalAddToCartData) => {
				const { cart } = get();
				const { product, quantity = 1 } = data;
				const existingItem = cart.items.find(
					(item) => item.product.id === product.id
				);

				let newItems: CartItem[];

				if (existingItem) {
					// Update existing item quantity
					newItems = cart.items.map((item) =>
						item.product.id === product.id
							? { ...item, quantity: item.quantity + quantity }
							: item
					);
				} else {
					// Add new item with full product details
					const newItem: CartItem = {
						id: `${product.id}-${Date.now()}`, // Unique ID for cart item
						product: {
							id: product.id,
							name: product.name,
							slug: product.slug,
							price: product.price,
							primary_image: product.primary_image,
						},
						quantity: quantity,
						subtotal: product.price * quantity,
					};
					newItems = [...cart.items, newItem];
				}

				// Recalculate totals
				const totalItems = newItems.reduce(
					(sum, item) => sum + item.quantity,
					0
				);
				const subtotal = newItems.reduce((sum, item) => sum + item.subtotal, 0);

				const newCart: Cart = {
					...cart,
					items: newItems,
					total_items: totalItems,
					subtotal,
					total: subtotal, // Assuming no additional fees for now
				};

				set({ cart: newCart });
				toast.success("Added to cart");
			},

			updateCartItem: (itemId: string, quantity: number) => {
				const { cart } = get();

				if (quantity <= 0) {
					get().removeFromCart(itemId);
					return;
				}

				const newItems = cart.items.map((item) => {
					if (item.id === itemId) {
						const newQuantity = quantity;
						const newSubtotal = item.product.price * newQuantity;
						return { ...item, quantity: newQuantity, subtotal: newSubtotal };
					}
					return item;
				});

				const totalItems = newItems.reduce(
					(sum, item) => sum + item.quantity,
					0
				);
				const subtotal = newItems.reduce((sum, item) => sum + item.subtotal, 0);

				const newCart: Cart = {
					...cart,
					items: newItems,
					total_items: totalItems,
					subtotal,
					total: subtotal,
				};

				set({ cart: newCart });
			},

			removeFromCart: (itemId: string) => {
				const { cart } = get();
				const newItems = cart.items.filter((item) => item.id !== itemId);

				const totalItems = newItems.reduce(
					(sum, item) => sum + item.quantity,
					0
				);
				const subtotal = newItems.reduce((sum, item) => sum + item.subtotal, 0);

				const newCart: Cart = {
					...cart,
					items: newItems,
					total_items: totalItems,
					subtotal,
					total: subtotal,
				};

				set({ cart: newCart });
				toast.success("Removed from cart");
			},

			clearCart: () => {
				set({ cart: initialCart });
			},

			getTotalItems: () => {
				return get().cart.total_items;
			},

			getSubtotal: () => {
				return get().cart.subtotal;
			},
		}),
		{
			name: "cart-storage", // Key for localStorage
			onRehydrateStorage: () => (state) => {
				if (state) {
					state.hydrated = true;
				}
			},
		}
	)
);

/**
 * Hook to get cart data (replaces useQuery)
 */
export function useCart() {
	const cart = useCartStore((state) => state.cart);
	const hydrated = useCartStore((state) => state.hydrated);
	const isLoading = !hydrated; // Loading until hydrated
	const error = null; // No error since it's local

	return {
		data: cart,
		isLoading,
		error,
	};
}

/**
 * Hook to add item to cart (using Zustand store)
 */
export function useAddToCart() {
	const addToCart = useCartStore((state) => state.addToCart);

	return {
		mutate: (data: LocalAddToCartData) => {
			addToCart(data);
		},
		isPending: false, // No async operation, so always false
		isError: false,
		error: null,
	};
}

/**
 * Hook to update cart item quantity (using Zustand store)
 */
export function useUpdateCartItem() {
	const updateCartItem = useCartStore((state) => state.updateCartItem);

	return {
		mutate: ({ itemId, quantity }: { itemId: string; quantity: number }) => {
			updateCartItem(itemId, quantity);
		},
		isPending: false, // No async operation, so always false
		isError: false,
		error: null,
	};
}

/**
 * Hook to remove item from cart (using Zustand store)
 */
export function useRemoveFromCart() {
	const removeFromCart = useCartStore((state) => state.removeFromCart);

	return {
		mutate: removeFromCart,
		isPending: false, // No async operation, so always false
		isError: false,
		error: null,
	};
}

/**
 * Hook to clear cart (using Zustand store)
 */
export function useClearCart() {
	const clearCart = useCartStore((state) => state.clearCart);

	return {
		mutate: clearCart,
		isPending: false, // No async operation, so always false
		isError: false,
		error: null,
	};
}
