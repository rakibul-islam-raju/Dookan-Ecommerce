import type { IWishlistItem } from "@/@types/Wishlist";
import { clientApi } from "./axios";

export const wishlistClientApi = {
	async getWishlist(): Promise<IWishlistItem[]> {
		const { data } = await clientApi.get<{ results: IWishlistItem[] }>(
			"/wishlists/"
		);
		return data.results;
	},

	async getProductIds(): Promise<string[]> {
		const { data } = await clientApi.get<string[]>(
			"/wishlists/product-ids/"
		);
		return data;
	},

	async toggle(productId: string): Promise<{ status: "added" | "removed" }> {
		const { data } = await clientApi.post<{ status: "added" | "removed" }>(
			"/wishlists/toggle/",
			{ product_id: productId }
		);
		return data;
	},

	async remove(productId: string): Promise<void> {
		await clientApi.delete(`/wishlists/remove/${productId}/`);
	},
};
