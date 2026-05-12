"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { env } from "@/config/env";
import { couponClientApi } from "@/lib/api/coupons";
import type { CouponValidateResponse } from "@/lib/api/coupons";
import {
	useCart,
	useRemoveFromCart,
	useUpdateCartItem,
} from "@/lib/hooks/useCart";
import {
	ArrowRight,
	Check,
	Loader2,
	Minus,
	Plus,
	ShoppingCart,
	Tag,
	Trash2,
	X,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useState } from "react";

export default function CartPage() {
	const { data: cart, isLoading, error } = useCart();
	const updateCartItem = useUpdateCartItem();
	const removeFromCart = useRemoveFromCart();

	const [couponCode, setCouponCode] = useState("");
	const [couponLoading, setCouponLoading] = useState(false);
	const [couponError, setCouponError] = useState("");
	const [appliedCoupon, setAppliedCoupon] = useState<CouponValidateResponse | null>(null);

	const items = cart?.items || [];
	const totalItems = cart?.total_items || 0;
	const subtotal = cart?.subtotal || 0;
	const discount = appliedCoupon ? parseFloat(appliedCoupon.discount_amount) : 0;
	const shipping = subtotal > 50 ? 0 : 10.0; // Free shipping over $50
	const total = subtotal - discount + shipping;

	const handleApplyCoupon = async () => {
		if (!couponCode.trim()) return;
		setCouponLoading(true);
		setCouponError("");
		try {
			const result = await couponClientApi.validate({
				code: couponCode.trim(),
				subtotal,
			});
			setAppliedCoupon(result);
		} catch (err: unknown) {
			const axiosErr = err as { response?: { data?: { code?: string[] } } };
			const message =
				axiosErr?.response?.data?.code?.[0] || "Invalid coupon code";
			setCouponError(message);
			setAppliedCoupon(null);
		} finally {
			setCouponLoading(false);
		}
	};

	const handleRemoveCoupon = () => {
		setAppliedCoupon(null);
		setCouponCode("");
		setCouponError("");
	};

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
												<div className="flex items-baseline gap-1.5 mt-1">
													<span className="text-muted-foreground">
														৳{item.variant ? item.variant.price : item.product.price}
													</span>
													{!item.variant && item.product.base_price && (
														<span className="text-xs text-muted-foreground line-through">
															৳{item.product.base_price}
														</span>
													)}
												</div>
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

					{/* Coupon Section */}
					<div className="rounded-xl border bg-card p-6">
						<div className="flex items-center gap-2 mb-4">
							<Tag className="size-4 text-muted-foreground" />
							<h3 className="font-medium">Discount Code</h3>
						</div>

						{appliedCoupon ? (
							<div className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3">
								<div className="flex items-center gap-2">
									<Check className="size-4 text-green-600" />
									<span className="font-mono font-semibold text-green-700 dark:text-green-400">
										{appliedCoupon.code}
									</span>
									<span className="text-sm text-green-600 dark:text-green-400">
										(-৳{parseFloat(appliedCoupon.discount_amount).toFixed(2)})
									</span>
								</div>
								<button
									onClick={handleRemoveCoupon}
									className="text-muted-foreground hover:text-destructive transition-colors"
								>
									<X className="size-4" />
								</button>
							</div>
						) : (
							<div>
								<div className="flex gap-2">
									<Input
										placeholder="Enter coupon code"
										value={couponCode}
										onChange={(e) => {
											setCouponCode(e.target.value.toUpperCase());
											setCouponError("");
										}}
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												e.preventDefault();
												handleApplyCoupon();
											}
										}}
										className={couponError ? "border-red-500" : ""}
									/>
									<Button
										variant="outline"
										onClick={handleApplyCoupon}
										disabled={couponLoading || !couponCode.trim()}
									>
										{couponLoading ? (
											<Loader2 className="size-4 animate-spin" />
										) : (
											"Apply"
										)}
									</Button>
								</div>
								{couponError && (
									<p className="text-sm text-red-500 mt-2">{couponError}</p>
								)}
							</div>
						)}
					</div>
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
							{discount > 0 && (
								<div className="flex justify-between text-green-600">
									<span>Discount ({appliedCoupon?.code})</span>
									<span className="font-medium">-৳{discount.toFixed(2)}</span>
								</div>
							)}
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
							<Link
								href={
									appliedCoupon
										? `/checkout?coupon=${appliedCoupon.code}`
										: "/checkout"
								}
							>
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
