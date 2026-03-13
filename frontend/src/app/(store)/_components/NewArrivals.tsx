import type { IConsumerProductListItem } from "@/@types/Product";
import { getErrorMessage } from "@/lib/api/axios";
import { productServerApi } from "@/lib/api/products";
import { NewArrivalsClient } from "./NewArrivalsClient";

export const NewArrivals = async () => {
	let products: IConsumerProductListItem[] = [];

	try {
		products = await productServerApi.getNewArrivals();
	} catch (error) {
		const errorMessage = getErrorMessage(error);
		console.error("Failed to fetch new arrivals:", {
			error: errorMessage,
			details: error,
		});
		// Return empty array on error - component will handle empty state
	}

	return <NewArrivalsClient products={products} />;
};
