"use client";

import { IConsumerProductDetail } from "@/@types/Product";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAddToCart } from "@/lib/hooks/useCart";
import { cn } from "@/lib/utils";
import {
	AlertTriangle,
	Check,
	Heart,
	Loader2,
	Minus,
	Plus,
	Share2,
	ShoppingCart,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface ProductDetailsClientProps {
	product: IConsumerProductDetail;
}

export const ProductDetailsClient = ({
	product,
}: ProductDetailsClientProps) => {
	const [selectedImage, setSelectedImage] = useState(
		product.images.find((img) => img.is_primary) || product.images[0]
	);
	const [quantity, setQuantity] = useState(1);
	const [isAddingToCart, setIsAddingToCart] = useState(false);

	const addToCartMutation = useAddToCart();

	const handleQuantityChange = (delta: number) => {
		const newQuantity = quantity + delta;
		if (newQuantity >= 1 && newQuantity <= product.stock_quantity) {
			setQuantity(newQuantity);
		}
	};

	const handleAddToCart = async () => {
		setIsAddingToCart(true);
		try {
			addToCartMutation.mutate({
				product: {
					id: product.id,
					name: product.name,
					slug: product.slug,
					price: product.price,
					discount_percentage: product.discount_percentage,
					primary_image: product.images[0]?.image,
				},
				quantity,
			});
			// Reset quantity after successful add
			setQuantity(1);
		} catch (error) {
			console.error("Failed to add to cart:", error);
		} finally {
			setIsAddingToCart(false);
		}
	};

	return (
		<div className="container py-8 md:py-12">
			{/* Breadcrumb */}
			<nav className="flex items-center text-sm text-muted-foreground mb-8">
				<Link href="/" className="hover:text-primary transition-colors">
					Home
				</Link>
				<span className="mx-2">/</span>
				<Link
					href={`/category/${product.category.slug}`}
					className="hover:text-primary transition-colors"
				>
					{product.category.name}
				</Link>
				<span className="mx-2">/</span>
				<span className="text-foreground font-medium truncate max-w-[200px]">
					{product.name}
				</span>
			</nav>

			<div className="grid md:grid-cols-2 gap-8 lg:gap-12">
				{/* Product Images */}
				<div className="space-y-4">
					<div className="aspect-square relative overflow-hidden rounded-xl border bg-muted">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<Image
							src={selectedImage.image}
							alt={selectedImage.alt_text}
							className="object-cover w-full h-full transition-all duration-300 hover:scale-105"
							unoptimized
							fill
						/>
						{product.discount_percentage > 0 && (
							<Badge className="absolute top-4 left-4 bg-destructive text-white border-none text-sm px-3 py-1">
								-{product.discount_percentage}%
							</Badge>
						)}
					</div>
					<div className="grid grid-cols-4 gap-4">
						{product.images.map((img) => (
							<button
								key={img.id}
								onClick={() => setSelectedImage(img)}
								className={cn(
									"aspect-square rounded-lg overflow-hidden border-2 transition-all",
									selectedImage.id === img.id
										? "border-primary ring-2 ring-primary/20"
										: "border-transparent hover:border-muted-foreground/25"
								)}
							>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<Image
									src={img.image}
									alt={img.alt_text}
									className="object-cover w-full h-full hover:scale-105 transition-all duration-300"
									unoptimized
									width={100}
									height={100}
								/>
							</button>
						))}
					</div>
				</div>

				{/* Product Info */}
				<div className="flex flex-col">
					<div className="mb-6">
						<h1 className="text-3xl md:text-4xl font-bold font-serif text-foreground mb-4">
							{product.name}
						</h1>
						<div className="flex flex-wrap items-center gap-3 mb-6">
							<span className="bg-secondary/50 text-secondary-foreground px-3 py-1 rounded-md text-xs font-semibold tracking-wide">
								SKU: {product.sku}
							</span>
							{product.discount_percentage > 0 && (
								<Badge className="bg-red-500/20 text-red-700 border-red-200 hover:bg-red-500/30">
									Save {product.discount_percentage}%
								</Badge>
							)}
							<div
								className={cn(
									"flex items-center gap-2 px-3 py-1 rounded-md font-medium text-sm",
									product.is_in_stock
										? "bg-green-500/10 text-green-700"
										: "bg-red-500/10 text-red-700"
								)}
							>
								{product.is_in_stock ? (
									<>
										<Check className="size-4" /> In Stock
									</>
								) : (
									<>
										<AlertTriangle className="size-4" /> Out of Stock
									</>
								)}
							</div>
						</div>

						<div className="flex items-baseline gap-3 mb-6">
							<span className="text-4xl font-bold text-primary">
								৳{product.price}
							</span>
							{product.discount_percentage > 0 && (
								<span className="text-xl text-muted-foreground line-through">
									৳{product.compare_at_price}
								</span>
							)}
						</div>

						{product.short_description && (
							<p className="text-muted-foreground leading-relaxed text-lg mb-8">
								{product.short_description}
							</p>
						)}

						<Separator className="mb-8" />

						{/* Actions */}
						<div className="space-y-6">
							<div className="space-y-3">
								<label className="text-sm font-medium text-foreground">
									Quantity
								</label>
								<div className="flex items-center gap-4">
									<div className="flex items-center border rounded-lg overflow-hidden">
										<button
											onClick={() => handleQuantityChange(-1)}
											disabled={quantity <= 1 || !product.is_in_stock}
											className="p-2 hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
											aria-label="Decrease quantity"
										>
											<Minus className="size-4" />
										</button>
										<span className="w-12 text-center font-semibold text-base">
											{quantity}
										</span>
										<button
											onClick={() => handleQuantityChange(1)}
											disabled={
												quantity >= product.stock_quantity ||
												!product.is_in_stock
											}
											className="p-2 hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
											aria-label="Increase quantity"
										>
											<Plus className="size-4" />
										</button>
									</div>
									<div className="text-sm text-muted-foreground">
										{product.unit_value} {product.unit} / pack
									</div>
								</div>
							</div>

							<div className="flex gap-3">
								<Button
									size="lg"
									className="flex-1 text-base h-12 font-semibold"
									disabled={!product.is_in_stock || isAddingToCart}
									onClick={handleAddToCart}
									aria-busy={isAddingToCart}
								>
									{isAddingToCart ? (
										<>
											<Loader2 className="mr-2 size-5 animate-spin" />
											Adding...
										</>
									) : (
										<>
											<ShoppingCart className="mr-2 size-5" />
											Add to Cart
										</>
									)}
								</Button>
								<Button
									size="lg"
									variant="outline"
									className="h-12 w-12 p-0"
									aria-label="Add to wishlist"
								>
									<Heart className="size-5" />
								</Button>
								<Button
									size="lg"
									variant="ghost"
									className="h-12 w-12 p-0"
									aria-label="Share product"
								>
									<Share2 className="size-5" />
								</Button>
							</div>

							{!product.is_in_stock && (
								<div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-center gap-2">
									<AlertTriangle className="size-4 text-destructive" />
									<span className="text-sm text-destructive font-medium">
										This product is currently out of stock
									</span>
								</div>
							)}
						</div>
					</div>

					{/* Additional Info */}
					{product.description && (
						<div className="mt-12 space-y-6">
							<div className="bg-muted/30 rounded-xl p-6 space-y-4">
								<h3 className="font-semibold text-lg">About this Product</h3>
								<pre className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
									{product?.description}
								</pre>
							</div>

							<div className="grid md:grid-cols-2 gap-6">
								<div className="bg-muted/20 rounded-lg p-4 space-y-3">
									<h4 className="font-semibold text-sm">Product Details</h4>
									<dl className="space-y-2 text-sm">
										<div className="flex justify-between">
											<dt className="text-muted-foreground">SKU:</dt>
											<dd className="font-medium">{product.sku}</dd>
										</div>
										<div className="flex justify-between">
											<dt className="text-muted-foreground">Category:</dt>
											<dd className="font-medium">{product.category.name}</dd>
										</div>
										<div className="flex justify-between">
											<dt className="text-muted-foreground">Unit Size:</dt>
											<dd className="font-medium">
												{product.unit_value} {product.unit}
											</dd>
										</div>
										{product.discount_percentage > 0 && (
											<div className="flex justify-between">
												<dt className="text-muted-foreground">Discount:</dt>
												<dd className="font-medium text-green-600">
													{product.discount_percentage}% OFF
												</dd>
											</div>
										)}
									</dl>
								</div>

								<div className="bg-muted/20 rounded-lg p-4 space-y-3">
									<h4 className="font-semibold text-sm">Availability</h4>
									<dl className="space-y-2 text-sm">
										<div className="flex justify-between items-center">
											<dt className="text-muted-foreground">Stock Status:</dt>
											<dd
												className={cn(
													"font-semibold",
													product.is_in_stock
														? "text-green-600"
														: "text-destructive"
												)}
											>
												{product.is_in_stock ? "In Stock" : "Out of Stock"}
											</dd>
										</div>
										<div className="flex justify-between">
											<dt className="text-muted-foreground">
												Available Quantity:
											</dt>
											<dd className="font-medium">
												{product.stock_quantity} units
											</dd>
										</div>
										<div className="flex justify-between">
											<dt className="text-muted-foreground">Product Status:</dt>
											<dd
												className={cn(
													"font-semibold",
													product.is_active
														? "text-green-600"
														: "text-muted-foreground"
												)}
											>
												{product.is_active ? "Active" : "Inactive"}
											</dd>
										</div>
									</dl>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
