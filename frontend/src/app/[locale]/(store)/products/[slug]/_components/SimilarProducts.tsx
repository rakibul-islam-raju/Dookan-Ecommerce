"use client";

import type { IConsumerProductListItem } from "@/@types/Product";
import { ProductItem } from "@/components/Product/ProductItem";
import { QuickViewModal } from "@/components/Product/QuickViewModal";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/lib/hooks/useProducts";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface SimilarProductsProps {
	categoryId: string;
	currentProductId: string;
}

export const SimilarProducts = ({
	categoryId,
	currentProductId,
}: SimilarProductsProps) => {
	const t = useTranslations("product");
	const [selectedProduct, setSelectedProduct] =
		useState<IConsumerProductListItem | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const { data, isLoading } = useProducts({
		category: categoryId,
		limit: 5,
	});

	const similarProducts =
		data?.results.filter((p) => p.id !== currentProductId).slice(0, 4) ?? [];

	if (!isLoading && similarProducts.length === 0) return null;

	return (
		<section className="mt-16 border-t pt-12">
			<div className="mb-8">
				<h2 className="text-2xl font-bold font-serif text-foreground">
					{t("similarProducts")}
				</h2>
				<p className="mt-1 text-muted-foreground text-sm">
					{t("moreSameCategory")}
				</p>
			</div>

			{isLoading ? (
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className="flex flex-col gap-3">
							<Skeleton className="aspect-square w-full rounded-xl" />
							<Skeleton className="h-4 w-2/3" />
							<Skeleton className="h-4 w-1/2" />
						</div>
					))}
				</div>
			) : (
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{similarProducts.map((product) => (
						<ProductItem
							key={product.id}
							product={product}
							onQuickView={(p) => {
								setSelectedProduct(p);
								setIsModalOpen(true);
							}}
						/>
					))}
				</div>
			)}

			<QuickViewModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				product={selectedProduct}
			/>
		</section>
	);
};
