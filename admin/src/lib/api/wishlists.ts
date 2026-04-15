import type { IPaginatedResponse } from "@/@types/Common.type";
import type { WishlistFilter, WishlistItem } from "@/@types/Wishlist";
import { queryKeys } from "@/constants/queryKeys";
import { queryOptions } from "@tanstack/react-query";
import { clientApi } from "./axios";

export const wishlistApi = {
	async list(params: WishlistFilter): Promise<IPaginatedResponse<WishlistItem>> {
		const { data } = await clientApi.get<IPaginatedResponse<WishlistItem>>(
			"/wishlists/admin/",
			{ params }
		);
		return data;
	},
};

export const getWishlists = (params: WishlistFilter) =>
	queryOptions({
		queryKey: [queryKeys.wishlists, { params }],
		queryFn: async () => wishlistApi.list(params),
	});
