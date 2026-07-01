"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useRemoveFromWishlist, useWishlist } from "@/lib/hooks/useWishlist";
import { Heart, Loader2, ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function WishlistPage() {
	const t = useTranslations("account");
	const productT = useTranslations("product");
	const commonT = useTranslations("common");
	const { data: items, isLoading } = useWishlist();
	const removeFromWishlist = useRemoveFromWishlist();

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
				<h2 className="text-xl font-semibold mb-2">
					{t("wishlistEmptyTitle")}
				</h2>
				<p className="text-muted-foreground mb-6">
					{t("wishlistEmptyDescription")}
				</p>
				<Button asChild>
					<Link href="/shop">{commonT("browseProducts")}</Link>
				</Button>
			</div>
		);
	}

	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold font-serif">
					{t("wishlistTitle", { count: items.length })}
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
										{productT("noImage")}
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
										৳{product.sale_price ?? product.base_price}
									</span>
									{product.sale_price && (
										<span className="text-sm text-muted-foreground line-through">
											৳{product.base_price}
										</span>
									)}
								</div>
							</div>

							{/* Actions */}
							<div className="flex flex-col gap-2 shrink-0">
								<Button size="sm" asChild>
									<Link href={`/products/${product.slug}`}>
										<ShoppingCart className="size-4 mr-1" />
										<span className="hidden sm:inline">{productT("viewProduct")}</span>
									</Link>
								</Button>
								<Button
									size="sm"
									variant="ghost"
									className="text-destructive hover:text-destructive hover:bg-destructive/10"
									onClick={() => removeFromWishlist.mutate(product.id)}
									disabled={removeFromWishlist.isPending}
								>
									<Trash2 className="size-4 mr-1" />
									<span className="hidden sm:inline">{commonT("remove")}</span>
								</Button>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
