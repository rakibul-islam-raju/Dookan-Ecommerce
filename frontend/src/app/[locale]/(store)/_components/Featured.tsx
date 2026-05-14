import type { IConsumerProductListItem } from "@/@types/Product";
import { getErrorMessage } from "@/lib/api/axios";
import { productServerApi } from "@/lib/api/products";
import { FeaturedClient } from "./FeaturedClient";

export const Featured = async () => {
	let products: IConsumerProductListItem[] = [];

	try {
		products = await productServerApi.getFeaturedProducts();
	} catch (error) {
		const errorMessage = getErrorMessage(error);
		console.error("Failed to fetch featured products:", {
			error: errorMessage,
			details: error,
		});
		// Return empty array on error - component will handle empty state
	}

	return <FeaturedClient products={products} />;
};
