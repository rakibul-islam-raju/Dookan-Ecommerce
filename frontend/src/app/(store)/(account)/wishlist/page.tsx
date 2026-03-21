"use client";

import { Button } from "@/components/ui/button";
import { useRemoveFromWishlist, useWishlist } from "@/lib/hooks/useWishlist";
import { useAddToCart } from "@/lib/hooks/useCart";
import { Heart, Loader2, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function WishlistPage() {
	const { data: items, isLoading } = useWishlist();
	const removeFromWishlist = useRemoveFromWishlist();
	const addToCart = useAddToCart();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[300px]">
				<Loader2 className="size-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!items || items.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[300px] text-center">
				<Heart className="size-16 text-muted-foreground/30 mb-4" />
				<h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
				<p className="text-muted-foreground mb-6">
					Save products you love for later by clicking the heart icon.
				</p>
				<Button asChild>
					<Link href="/shop">Browse Products</Link>
				</Button>
			</div>
		);
	}

	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold font-serif">
					My Wishlist ({items.length})
				</h1>
			</div>

			<div className="grid gap-4">
				{items.map((item) => {
					const { product } = item;
					return (
						<div
							key={item.id}
							className="flex gap-4 p-4 border rounded-lg hover:border-primary/20 transition-colors"
						>
							{/* Product Image */}
							<Link
								href={`/products/${product.slug}`}
								className="shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-muted"
							>
								{product.primary_image ? (
									<Image
										src={product.primary_image}
										alt={product.name}
										width={96}
										height={96}
										className="object-cover w-full h-full"
										unoptimized
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
										No Image
									</div>
								)}
							</Link>

							{/* Product Info */}
							<div className="flex-1 min-w-0">
								<Link
									href={`/products/${product.slug}`}
									className="font-semibold hover:text-primary transition-colors line-clamp-1"
								>
									{product.name}
								</Link>
								<p className="text-xs text-muted-foreground mt-0.5">
									{product.category.name}
								</p>
								<div className="flex items-baseline gap-2 mt-2">
									<span className="text-lg font-bold text-primary">
										৳{product.price}
									</span>
									{product.compare_at_price && (
										<span className="text-sm text-muted-foreground line-through">
											৳{product.compare_at_price}
										</span>
									)}
								</div>
							</div>

							{/* Actions */}
							<div className="flex flex-col gap-2 shrink-0">
								<Button
									size="sm"
									disabled={!product.is_in_stock}
									onClick={() =>
										addToCart.mutate({
											product,
											quantity: 1,
										})
									}
								>
									<ShoppingCart className="size-4 mr-1" />
									<span className="hidden sm:inline">
										{product.is_in_stock ? "Add to Cart" : "Out of Stock"}
									</span>
								</Button>
								<Button
									size="sm"
									variant="ghost"
									className="text-destructive hover:text-destructive hover:bg-destructive/10"
									onClick={() => removeFromWishlist.mutate(product.id)}
									disabled={removeFromWishlist.isPending}
								>
									<Trash2 className="size-4 mr-1" />
									<span className="hidden sm:inline">Remove</span>
								</Button>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
