import { store } from "@/config/store";
import { Metadata } from "next";
import { Suspense } from "react";
import { ShopContent } from "./_components/ShopContent";

export const metadata: Metadata = {
	title: `Shop | ${store.title}`,
	description: `Browse our collection of organic products at ${store.title}`,
	keywords: [
		"organic products",
		"shop",
		"organic food",
		"vegetables",
		"fruits",
		`${store.title}`,
	],
};

export default function ShopPage() {
	return (
		<Suspense>
			<ShopContent />
		</Suspense>
	);
}
