import { IConsumerProductListItem } from "@/@types/Product";
import { Button } from "@/components/ui/button";
import { env } from "@/config/env";
import { useAddToCart } from "@/lib/hooks/useCart";
import { cn } from "@/lib/utils";
import { Check, Loader2, ShoppingCart, X } from "lucide-react";
import { WishlistButton } from "./WishlistButton";
import Image from "next/image";
import { useEffect } from "react";
import { createPortal } from "react-dom";

interface QuickViewModalProps {
	isOpen: boolean;
	onClose: () => void;
	product: IConsumerProductListItem | null;
}

export const QuickViewModal = ({
	isOpen,
	onClose,
	product,
}: QuickViewModalProps) => {
	const canUseDOM = typeof document !== "undefined";
	const addToCart = useAddToCart();

	useEffect(() => {
		if (!isOpen) {
			document.body.style.overflow = "unset";
			return;
		}

		document.body.style.overflow = "hidden";

		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isOpen]);

	if (!canUseDOM || !product) return null;

	const {
		name,
		category,
		base_price,
		sale_price,
		sale_discount_percentage,
		primary_image,
		short_description,
		is_in_stock,
		unit,
		unit_value,
		is_low_stock,
	} = product;

	const displayPrice = sale_price ?? base_price;

	const imageUrl = primary_image
		? primary_image.startsWith("http")
			? primary_image
			: `${env.api.baseAppUrl}${
					primary_image.startsWith("/") ? "" : "/"
			  }${primary_image}`
		: "";

	const content = (
		<div
			className={cn(
				"fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
				isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
			)}
			onClick={onClose}
		>
			<div
				className={cn(
					"relative w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 dark:bg-zinc-900",
					isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
				)}
				onClick={(e) => e.stopPropagation()}
			>
				<Button
					variant="ghost"
					size="icon"
					className="absolute right-4 top-4 z-10 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
					onClick={onClose}
				>
					<X className="h-5 w-5" />
				</Button>

				<div className="grid grid-cols-1 md:grid-cols-2">
					{/* Image Section */}
					<div className="relative aspect-square md:aspect-auto md:h-full bg-zinc-100 dark:bg-zinc-800">
						{primary_image ? (
							<Image
								src={imageUrl}
								alt={name}
								fill
								className="object-cover transition-transform duration-500 group-hover:scale-105"
								sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
								unoptimized={
									imageUrl.startsWith("http://localhost") ||
									imageUrl.startsWith("http://127.0.0.1")
								}
							/>
						) : (
							<div className="flex h-full w-full items-center justify-center text-zinc-400">
								No Image
							</div>
						)}
					</div>

					{/* Details Section */}
					<div className="flex flex-col p-6 md:p-8">
						<div className="mb-4">
							<span className="mb-2 inline-block rounded-full bg-accent px-3 py-1 text-xs font-medium text-foreground">
								{category.name}
							</span>
							<h2 className="text-2xl font-bold text-foreground md:text-3xl">
								{name}
							</h2>
						</div>

						<div className="mb-6 flex items-baseline gap-3">
							{sale_price && sale_discount_percentage > 0 ? (
								<>
									<span className="text-3xl font-bold text-primary">
										৳{sale_price}
									</span>
									<span className="text-xl text-zinc-400 line-through">
										৳{base_price}
									</span>
									<span className="text-sm font-medium text-red-500">
										{sale_discount_percentage}% OFF
									</span>
								</>
							) : (
								<span className="text-3xl font-bold text-foreground">
									৳{displayPrice}
								</span>
							)}
						</div>

						<div className="mb-6 space-y-4">
							<p className="text-muted-foreground">{short_description}</p>

							<div className="flex items-center gap-4 text-sm text-muted-foreground">
								<div className="flex items-center gap-2">
									{is_in_stock ? (
										<Check className="h-4 w-4 text-green-500" />
									) : (
										<X className="h-4 w-4 text-red-500" />
									)}
									<span>{is_in_stock ? "In Stock" : "Out of Stock"}</span>
								</div>
								<span>•</span>
								<span>
									{unit_value} {unit}
								</span>
								{is_low_stock && (
									<>
										<span>•</span>
										<span className="text-sm font-medium text-yellow-500">
											Low Stock
										</span>
									</>
								)}
							</div>
						</div>

						<div className="mt-auto flex flex-col gap-4">
							<div className="flex gap-4">
								<Button
									className="flex-1 gap-2"
									size="lg"
									disabled={!is_in_stock || addToCart.isPending}
									onClick={() => {
										if (product) {
											addToCart.mutate({
												product,
												quantity: 1,
											});
										}
									}}
								>
									{addToCart.isPending ? (
										<Loader2 className="h-5 w-5 animate-spin" />
									) : (
										<ShoppingCart className="h-5 w-5" />
									)}
									{addToCart.isPending ? "Adding..." : "Add to Cart"}
								</Button>
								<WishlistButton
									productId={product.id}
									variant="icon-outline"
									className="h-10 w-10"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);

	return createPortal(content, document.body);
};
