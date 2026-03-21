import type { IConsumerProductListItem } from "./Product";

export interface IWishlistItem {
	id: string;
	product: IConsumerProductListItem;
	created_at: string;
}
