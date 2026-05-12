"use client";

import { IConsumerProductListItem } from "@/@types/Product";
import { Link } from "@/i18n/navigation";
import { ProductItem } from "@/components/Product/ProductItem";
import { QuickViewModal } from "@/components/Product/QuickViewModal";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

interface NewArrivalsClientProps {
	products: IConsumerProductListItem[];
}

export const NewArrivalsClient = ({ products }: NewArrivalsClientProps) => {
	const [selectedProduct, setSelectedProduct] =
		useState<IConsumerProductListItem | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleQuickView = (product: IConsumerProductListItem) => {
		setSelectedProduct(product);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
	};

	return (
		<section className="container py-16">
			<div className="mb-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
				<div>
					<h2 className="text-3xl font-bold font-serif text-foreground md:text-4xl">
						New Arrivals
					</h2>
					<p className="mt-2 text-muted-foreground">
						Discover our latest collection of premium organic products
					</p>
				</div>
				<Button variant="ghost" className="group" asChild>
					<Link href="/shop">
						View All
						<ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
					</Link>
				</Button>
			</div>

			{products.length > 0 ? (
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{products.map((product) => (
						<ProductItem
							key={product.id}
							product={product}
							onQuickView={handleQuickView}
						/>
					))}
				</div>
			) : (
				<div className="text-center py-12">
					<p className="text-muted-foreground">
						No new products available at the moment.
					</p>
				</div>
			)}

			<QuickViewModal
				isOpen={isModalOpen}
				onClose={handleCloseModal}
				product={selectedProduct}
			/>
		</section>
	);
};
