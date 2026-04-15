/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Cart Store using Zustand
 * Client-side cart management with local storage
 */

"use client";

import { type Cart, type CartItem } from "@/lib/api";
import { initMetaPixel, trackMetaAddToCart } from "@/lib/meta";
import { useSiteConfigContext } from "@/lib/providers/site-config-provider";
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
	variant: {
		id: string;
		name: string;
		sku: string;
		price: number;
	};
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
 * Generate a unique cart item key based on product + variant
 */
function getCartItemKey(productId: string, variantId: string): string {
	return `${productId}-${variantId}`;
}

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
				const { product, variant, quantity = 1 } = data;
				const itemKey = getCartItemKey(product.id, variant.id);

				const existingItem = cart.items.find((item) => {
					const existingKey = getCartItemKey(
						item.product.id,
						item.variant.id
					);
					return existingKey === itemKey;
				});

				const effectivePrice = variant.price;
				let newItems: CartItem[];

				if (existingItem) {
					// Update existing item quantity
					newItems = cart.items.map((item) => {
						const key = getCartItemKey(item.product.id, item.variant.id);
						if (key === itemKey) {
							const newQty = item.quantity + quantity;
							return {
								...item,
								quantity: newQty,
								subtotal: effectivePrice * newQty,
							};
						}
						return item;
					});
				} else {
					// Add new item with full product details
					const basePrice = product.base_price
						? Number(product.base_price)
						: undefined;
					const newItem: CartItem = {
						id: `${itemKey}-${Date.now()}`, // Unique ID for cart item
						product: {
							id: product.id,
							name: product.name,
							slug: product.slug,
							price: effectivePrice,
							...(basePrice && basePrice !== effectivePrice
								? { base_price: basePrice }
								: {}),
							primary_image: product.primary_image,
						},
						variant,
						quantity: quantity,
						subtotal: effectivePrice * quantity,
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
						const effectivePrice = item.variant.price;
						const newSubtotal = effectivePrice * quantity;
						return { ...item, quantity, subtotal: newSubtotal };
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
	const { config } = useSiteConfigContext();

	return {
		mutate: (data: LocalAddToCartData) => {
			const price = data.variant.price;
			const quantity = data.quantity ?? 1;

			addToCart(data);
			if (config?.meta_pixel_enabled && config.meta_pixel_id) {
				initMetaPixel(config.meta_pixel_id);
			}
			trackMetaAddToCart({
				productId: data.product.id,
				price,
				quantity,
				currency: config?.meta_default_currency || "BDT",
			});
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
