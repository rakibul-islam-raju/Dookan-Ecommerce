"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { env } from "@/config/env";
import {
	useCart,
	useRemoveFromCart,
	useUpdateCartItem,
} from "@/lib/hooks/useCart";
import {
	ArrowRight,
	Loader2,
	Minus,
	Plus,
	ShoppingCart,
	Trash2,
} from "lucide-react";
import Link from "next/link";

export default function CartPage() {
	const { data: cart, isLoading, error } = useCart();
	const updateCartItem = useUpdateCartItem();
	const removeFromCart = useRemoveFromCart();

	const items = cart?.items || [];
	const totalItems = cart?.total_items || 0;
	const subtotal = cart?.subtotal || 0;
	const shipping = subtotal > 50 ? 0 : 10.0; // Free shipping over $50
	const total = subtotal + shipping;

	const updateQuantity = (itemId: string, delta: number) => {
		const item = items.find((item) => item.id === itemId);
		if (!item) return;

		const newQuantity = Math.max(1, item.quantity + delta);
		updateCartItem.mutate({ itemId, quantity: newQuantity });
	};

	const removeItem = (itemId: string) => {
		removeFromCart.mutate(itemId);
	};

	const getImageUrl = (image?: string) => {
		if (!image) return "";
		if (image.startsWith("http")) return image;
		return `${env.api.baseAppUrl}${image.startsWith("/") ? "" : "/"}${image}`;
	};

	if (isLoading) {
		return (
			<div className="container py-20 flex flex-col items-center justify-center text-center space-y-6">
				<div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
					<Loader2 className="size-12 text-muted-foreground animate-spin" />
				</div>
				<div className="space-y-2">
					<h1 className="text-3xl font-bold font-serif">
						Loading your cart...
					</h1>
					<p className="text-muted-foreground max-w-md mx-auto">
						Please wait while we load your cart items.
					</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="container py-20 flex flex-col items-center justify-center text-center space-y-6">
				<div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
					<ShoppingCart className="size-12 text-muted-foreground" />
				</div>
				<div className="space-y-2">
					<h1 className="text-3xl font-bold font-serif">Unable to load cart</h1>
					<p className="text-muted-foreground max-w-md mx-auto">
						We encountered an error loading your cart. Please try refreshing the
						page.
					</p>
				</div>
				<Button size="lg" onClick={() => window.location.reload()}>
					Refresh Page
				</Button>
			</div>
		);
	}

	if (items.length === 0) {
		return (
			<div className="container py-20 flex flex-col items-center justify-center text-center space-y-6">
				<div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
					<ShoppingCart className="size-12 text-muted-foreground" />
				</div>
				<div className="space-y-2">
					<h1 className="text-3xl font-bold font-serif">Your cart is empty</h1>
					<p className="text-muted-foreground max-w-md mx-auto">
						Looks like you haven&apos;t added anything to your cart yet. Browse
						our products to find something you love.
					</p>
				</div>
				<Button size="lg" asChild>
					<Link href="/">Start Shopping</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="container py-8 md:py-12">
			<h1 className="text-3xl font-bold font-serif mb-8">Shopping Cart</h1>

			<div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
				{/* Cart Items List */}
				<div className="lg:col-span-2 space-y-6">
					<div className="rounded-xl border bg-card overflow-hidden">
						<div className="p-6 space-y-6">
							{items.map((item) => (
								<div key={item.id} className="flex gap-4 sm:gap-6">
									{/* Image */}
									<div className="h-24 w-24 sm:h-32 sm:w-32 rounded-lg border bg-muted overflow-hidden shrink-0">
										{/* eslint-disable-next-line @next/next/no-img-element */}
										<img
											src={getImageUrl(item.product.primary_image)}
											alt={item.product.name}
											className="w-full h-full object-cover"
										/>
									</div>

									{/* Details */}
									<div className="flex-1 min-w-0 flex flex-col justify-between">
										<div className="flex justify-between items-start gap-4">
											<div>
												<h3 className="font-medium text-lg leading-tight">
													<Link
														href={`/products/${item.product.slug}`}
														className="hover:underline hover:text-primary transition-colors"
													>
														{item.product.name}
													</Link>
												</h3>
												{item.variant && (
													<p className="text-sm text-muted-foreground mt-0.5">
														{item.variant.name}
													</p>
												)}
												<p className="text-muted-foreground mt-1">
													৳{item.variant ? item.variant.price : item.product.price}
												</p>
											</div>
											<div className="text-right font-medium hidden sm:block">
												৳{item.subtotal}
											</div>
										</div>

										<div className="flex items-center justify-between mt-4">
											<div className="flex items-center border rounded-md h-10">
												<button
													onClick={() => updateQuantity(item.id, -1)}
													disabled={updateCartItem.isPending}
													className="px-3 hover:bg-muted h-full transition-colors disabled:opacity-50"
												>
													<Minus className="size-4" />
												</button>
												<span className="w-12 text-center font-medium">
													{item.quantity}
												</span>
												<button
													onClick={() => updateQuantity(item.id, 1)}
													disabled={updateCartItem.isPending}
													className="px-3 hover:bg-muted h-full transition-colors disabled:opacity-50"
												>
													<Plus className="size-4" />
												</button>
											</div>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => removeItem(item.id)}
												disabled={removeFromCart.isPending}
												className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-50"
											>
												{removeFromCart.isPending ? (
													<Loader2 className="size-4 mr-2 animate-spin" />
												) : (
													<Trash2 className="size-4 mr-2" />
												)}
												<span className="hidden sm:inline">
													{removeFromCart.isPending ? "Removing..." : "Remove"}
												</span>
											</Button>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Additional Options (Coupon, Note) can go here */}
					{/* <div className="flex flex-col sm:flex-row gap-4">
						<div className="flex-1">
							<label
								htmlFor="coupon"
								className="text-sm font-medium mb-2 block"
							>
								Apply Coupon
							</label>
							<div className="flex gap-2">
								<Input id="coupon" placeholder="Enter coupon code" />
								<Button variant="outline">Apply</Button>
							</div>
						</div>
					</div> */}
				</div>

				{/* Order Summary */}
				<div className="lg:col-span-1">
					<div className="sticky top-24 rounded-xl border bg-muted/30 p-6 space-y-6">
						<h2 className="font-semibold text-xl">Order Summary</h2>

						<div className="space-y-4 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">
									Subtotal ({totalItems} items)
								</span>
								<span className="font-medium">৳{subtotal.toFixed(2)}</span>
							</div>
							{/* <div className="flex justify-between">
								<span className="text-muted-foreground">
									Shipping{" "}
									{subtotal >= 50 && (
										<span className="text-green-600 font-medium">(Free)</span>
									)}
								</span>
								<span className="font-medium">
									{shipping === 0 ? (
										<span className="text-green-600">FREE</span>
									) : (
										`৳${shipping.toFixed(2)}`
									)}
								</span>
							</div> */}
							<div className="flex justify-between">
								<span className="text-muted-foreground">Tax Estimate</span>
								<span className="text-muted-foreground">
									Calculated at checkout
								</span>
							</div>
						</div>

						<Separator />

						<div className="flex justify-between items-end">
							<span className="font-bold text-lg">Total</span>
							<div className="text-right">
								<span className="text-xs text-muted-foreground block font-normal mb-1">
									BDT
								</span>
								<span className="font-bold text-2xl">৳{total.toFixed(2)}</span>
							</div>
						</div>

						<Button className="w-full h-12 text-lg" size="lg" asChild>
							<Link href="/checkout">
								Proceed to Checkout <ArrowRight className="ml-2 size-5" />
							</Link>
						</Button>

						<div className="text-center text-xs text-muted-foreground mt-4">
							Shipping, taxes, and discounts calculated at checkout.
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
