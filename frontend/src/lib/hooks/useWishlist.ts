"use client";

import type { IWishlistItem } from "@/@types/Wishlist";
import { wishlistClientApi } from "@/lib/api/wishlists";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export const wishlistKeys = {
	all: ["wishlists"] as const,
	list: () => [...wishlistKeys.all, "list"] as const,
	productIds: () => [...wishlistKeys.all, "product-ids"] as const,
};

export function useWishlist() {
	const user = useAuthStore((state) => state.user);

	return useQuery<IWishlistItem[]>({
		queryKey: wishlistKeys.list(),
		queryFn: () => wishlistClientApi.getWishlist(),
		enabled: !!user,
		staleTime: 5 * 60 * 1000,
	});
}

export function useWishlistProductIds() {
	const user = useAuthStore((state) => state.user);

	return useQuery<string[]>({
		queryKey: wishlistKeys.productIds(),
		queryFn: () => wishlistClientApi.getProductIds(),
		enabled: !!user,
		staleTime: 5 * 60 * 1000,
	});
}

export function useToggleWishlist() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (productId: string) => wishlistClientApi.toggle(productId),
		onMutate: async (productId) => {
			await queryClient.cancelQueries({ queryKey: wishlistKeys.productIds() });

			const previousIds = queryClient.getQueryData<string[]>(
				wishlistKeys.productIds()
			);

			// Optimistically update product IDs
			queryClient.setQueryData<string[]>(wishlistKeys.productIds(), (old) => {
				if (!old) return [productId];
				if (old.includes(productId)) {
					return old.filter((id) => id !== productId);
				}
				return [...old, productId];
			});

			return { previousIds };
		},
		onError: (_err, _productId, context) => {
			if (context?.previousIds) {
				queryClient.setQueryData(wishlistKeys.productIds(), context.previousIds);
			}
		},
		onSuccess: (data) => {
			if (data.status === "added") {
				toast.success("Added to wishlist");
			} else {
				toast.success("Removed from wishlist");
			}
			queryClient.invalidateQueries({ queryKey: wishlistKeys.list() });
		},
	});
}

export function useRemoveFromWishlist() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (productId: string) => wishlistClientApi.remove(productId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
			toast.success("Removed from wishlist");
		},
	});
}
