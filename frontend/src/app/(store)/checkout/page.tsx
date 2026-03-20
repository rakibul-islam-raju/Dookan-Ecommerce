"use client";

import type { ICreateOrderRequest } from "@/@types/Order";
import { GuestOrderSuccessModal } from "@/components/GuestOrderSuccessModal";
import { BaseForm } from "@/components/ui/@form/BaseForm";
import { TextField } from "@/components/ui/@form/TextField";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Separator } from "@/components/ui/separator";
import { env } from "@/config/env";
import { useZodForm } from "@/hooks/useZodForm";
import { useCart } from "@/lib/hooks/useCart";
import { useCreateOrder } from "@/lib/hooks/useOrders";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { cn } from "@/lib/utils";
import { couponClientApi } from "@/lib/api/coupons";
import type { CouponValidateResponse } from "@/lib/api/coupons";
import {
	ArrowLeft,
	Check,
	Loader2,
	Lock,
	ShieldCheck,
	Tag,
	Truck,
	X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { z } from "zod";

const checkoutSchema = z.object({
	customer_name: z.string().min(1, "Full name is required"),
	customer_email: z
		.string()
		.email("Please enter a valid email address")
		.optional()
		.or(z.literal("")),
	guest_mobile_number: z.string().min(1, "Mobile number is required"),
	address_line1: z.string().min(1, "Address is required"),
	address_line2: z.string().optional(),
	city: z.string().min(1, "City is required"),
	postal_code: z.string().min(1, "Postal code is required"),
	mobile_number: z.string().min(1, "Delivery phone number is required"),
	delivery_type: z.enum(["inside_dhaka", "outside_dhaka"]),
	customer_note: z.string().optional(),
	newsletter: z.boolean().default(false),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const user = useAuthStore((state) => state.user);
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

	const { data: cart, isLoading: cartLoading } = useCart();
	const createOrder = useCreateOrder();

	// Coupon state
	const [couponCode, setCouponCode] = useState(
		searchParams.get("coupon") || ""
	);
	const [couponLoading, setCouponLoading] = useState(false);
	const [couponError, setCouponError] = useState("");
	const [appliedCoupon, setAppliedCoupon] =
		useState<CouponValidateResponse | null>(null);

	const form = useZodForm(checkoutSchema, {
		defaultValues: {
			customer_name: "",
			customer_email: "",
			guest_mobile_number: "",
			address_line1: "",
			address_line2: "",
			city: "",
			postal_code: "",
			mobile_number: "",
			delivery_type: "inside_dhaka",
			customer_note: "",
			newsletter: false,
		},
	});

	// Calculate totals
	const items = cart?.items || [];
	const subtotal = cart?.subtotal || 0;
	const discount = appliedCoupon
		? parseFloat(appliedCoupon.discount_amount)
		: 0;
	const [selectedDeliveryType, setSelectedDeliveryType] = useState<
		"inside_dhaka" | "outside_dhaka"
	>("inside_dhaka");
	const [showGuestSuccessModal, setShowGuestSuccessModal] = useState(false);
	const [guestOrderNumber, setGuestOrderNumber] = useState<
		string | undefined
	>();

	const handleDeliveryTypeChange = (type: "inside_dhaka" | "outside_dhaka") => {
		setSelectedDeliveryType(type);
		form.setValue("delivery_type", type);
	};
	// Free shipping for orders over ৳1000
	const baseShipping = selectedDeliveryType === "inside_dhaka" ? 60 : 120;
	const shipping = subtotal >= 1000 ? 0 : baseShipping;
	const tax = 0; // No tax for now
	const total = subtotal - discount + shipping + tax;

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

	const deliveryType = form.watch("delivery_type");

	// Handle order submission
	const handleSubmitOrder = async (data: CheckoutFormValues) => {
		if (!cart || items.length === 0) {
			return;
		}

		// Prepare order data
		const orderData: ICreateOrderRequest = {
			customer_name: data.customer_name,
			customer_email: data.customer_email || undefined,
			guest_mobile_number: data.guest_mobile_number,
			payment_method: "cod", // Only COD supported
			delivery_type: data.delivery_type,
			customer_note: data.customer_note || undefined,
			coupon_code: appliedCoupon?.code || undefined,
			items: items.map((item) => ({
				product_id: item.product.id,
				quantity: item.quantity,
			})),
			shipping_address: {
				full_name: data.customer_name,
				mobile_number: data.mobile_number,
				address_line1: data.address_line1,
				address_line2: data.address_line2 || undefined,
				city: data.city,
				state: data.city, // Using city as state for simplicity
				postal_code: data.postal_code,
				country: "Bangladesh",
			},
		};

		try {
			const result = await createOrder.mutateAsync(orderData);

			// For guest users, show success modal instead of redirecting to orders page
			if (!isAuthenticated) {
				console.log("result ==>", result);
				console.log("result.order_number ==>", result.order_number);
				console.log("result.id ==>", result.id);
				setGuestOrderNumber(result.order_number);
				setShowGuestSuccessModal(true);
			} else {
				// For authenticated users, redirect to order confirmation page
				router.push(`/orders/${result.id}`);
			}
		} catch (error) {
			// Error is handled by the mutation
			console.error("Order creation failed:", error);
		}
	};

	// Get image URL helper
	const getImageUrl = (image?: string) => {
		if (!image) return "";
		if (image.startsWith("http")) return image;
		return `${env.api.baseAppUrl}${image.startsWith("/") ? "" : "/"}${image}`;
	};

	// Auto-validate coupon from URL params
	useEffect(() => {
		const couponParam = searchParams.get("coupon");
		if (couponParam && subtotal > 0 && !appliedCoupon) {
			setCouponCode(couponParam);
			couponClientApi
				.validate({ code: couponParam, subtotal })
				.then((result) => setAppliedCoupon(result))
				.catch(() => {
					// Silently ignore invalid coupon from URL
				});
		}
	}, [searchParams, subtotal]);

	useEffect(() => {
		if (user) {
			form.setValue("customer_name", user?.first_name + " " + user?.last_name);
			form.setValue("customer_email", user?.email);
			form.setValue(
				"address_line1",
				user?.default_address?.address_line1 || ""
			);
			form.setValue(
				"address_line2",
				user?.default_address?.address_line2 || ""
			);
			form.setValue("city", user?.default_address?.city || "");
			form.setValue("postal_code", user?.default_address?.postal_code || "");
			form.setValue(
				"mobile_number",
				user?.default_address?.mobile_number || ""
			);
			form.setValue("guest_mobile_number", user?.mobile_number || "");
		}
	}, [user, form]);

	// Show loading if cart is still loading
	if (cartLoading) {
		return (
			<div className="container py-20 flex flex-col items-center justify-center text-center space-y-6">
				<div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
					<Loader2 className="size-12 text-muted-foreground animate-spin" />
				</div>
				<div className="space-y-2">
					<h1 className="text-3xl font-bold font-serif">Loading checkout...</h1>
					<p className="text-muted-foreground max-w-md mx-auto">
						Please wait while we prepare your checkout.
					</p>
				</div>
			</div>
		);
	}

	// Redirect to cart if empty
	if (!cart || items.length === 0) {
		return (
			<div className="container py-20 flex flex-col items-center justify-center text-center space-y-6">
				<div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
					<Truck className="size-12 text-muted-foreground" />
				</div>
				<div className="space-y-2">
					<h1 className="text-3xl font-bold font-serif">Your cart is empty</h1>
					<p className="text-muted-foreground max-w-md mx-auto">
						Add some items to your cart before checking out.
					</p>
				</div>
				<Link href="/">
					<Button size="lg">Continue Shopping</Button>
				</Link>
				{/* Guest Order Success Modal */}
				<GuestOrderSuccessModal
					isOpen={showGuestSuccessModal}
					onClose={() => setShowGuestSuccessModal(false)}
					orderNumber={guestOrderNumber}
				/>
			</div>
		);
	}

	return (
		<div className="container py-8 md:py-12">
			<div className="mb-8">
				<Link
					href="/cart"
					className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
				>
					<ArrowLeft className="size-4 mr-1" /> Back to Cart
				</Link>
				<h1 className="text-3xl font-bold font-serif mt-4">Checkout</h1>
			</div>

			<BaseForm form={form} onSubmit={handleSubmitOrder}>
				<div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
					{/* Left Column: Forms */}
					<div className="lg:col-span-2 space-y-8">
						{/* Contact Info */}
						<section className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-semibold">Contact Information</h2>
								{!user && (
									<Link
										href="/login"
										className="text-sm text-primary hover:underline"
									>
										Already have an account? Log in
									</Link>
								)}
							</div>
							<TextField
								name="customer_email"
								label="Email Address"
								placeholder="you@example.com"
								type="email"
								disabled={isAuthenticated}
							/>
							<TextField
								name="guest_mobile_number"
								label="Mobile Number"
								placeholder="+880 1XX XXX XXXX"
								type="tel"
								required
								disabled={isAuthenticated}
							/>
							<div className="flex items-center gap-2">
								<input
									type="checkbox"
									id="newsletter"
									{...form.register("newsletter")}
									className="rounded border-input text-primary focus:ring-primary"
								/>
								<label
									htmlFor="newsletter"
									className="text-sm text-muted-foreground"
								>
									Email me with news and offers
								</label>
							</div>
						</section>

						<Separator />

						{/* Shipping Address */}
						<section className="space-y-4">
							<h2 className="text-xl font-semibold">Shipping Address</h2>
							<TextField
								name="customer_name"
								label="Full Name"
								placeholder="John Doe"
								required
							/>
							<TextField
								name="address_line1"
								label="Address Line 1"
								placeholder="123 Main Street"
								required
							/>
							<TextField
								name="address_line2"
								label="Address Line 2"
								placeholder="Apt 4B (optional)"
							/>
							<div className="grid grid-cols-2 gap-4">
								<TextField
									name="city"
									label="City"
									placeholder="Dhaka"
									required
								/>
								<TextField
									name="postal_code"
									label="Postal Code"
									placeholder="1216"
									required
								/>
							</div>
							<TextField
								name="mobile_number"
								label="Delivery Contact Phone"
								placeholder="+880 1XX XXX XXXX"
								type="tel"
								required
							/>
						</section>

						<Separator />

						{/* Shipping Method */}
						<section className="space-y-4">
							<h2 className="text-xl font-semibold">Delivery Area</h2>
							<div className="space-y-3">
								<div
									className={cn(
										"border rounded-lg p-4 cursor-pointer transition-all",
										selectedDeliveryType === "inside_dhaka"
											? "border-primary ring-1 ring-primary bg-primary/5"
											: "hover:border-muted-foreground/50"
									)}
									onClick={() => handleDeliveryTypeChange("inside_dhaka")}
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div
												className={cn(
													"w-4 h-4 rounded-full border flex items-center justify-center",
													selectedDeliveryType === "inside_dhaka"
														? "border-primary"
														: "border-muted-foreground"
												)}
											>
												{selectedDeliveryType === "inside_dhaka" && (
													<div className="w-2 h-2 rounded-full bg-primary" />
												)}
											</div>
											<div className="flex items-center gap-3">
												<Truck className="size-5 text-muted-foreground" />
												<div>
													<span className="font-medium">Inside Dhaka</span>
													<p className="text-sm text-muted-foreground">
														Delivery within Dhaka city limits
													</p>
												</div>
											</div>
										</div>
										<span className="font-semibold">৳60</span>
									</div>
								</div>

								<div
									className={cn(
										"border rounded-lg p-4 cursor-pointer transition-all",
										selectedDeliveryType === "outside_dhaka"
											? "border-primary ring-1 ring-primary bg-primary/5"
											: "hover:border-muted-foreground/50"
									)}
									onClick={() => handleDeliveryTypeChange("outside_dhaka")}
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div
												className={cn(
													"w-4 h-4 rounded-full border flex items-center justify-center",
													selectedDeliveryType === "outside_dhaka"
														? "border-primary"
														: "border-muted-foreground"
												)}
											>
												{selectedDeliveryType === "outside_dhaka" && (
													<div className="w-2 h-2 rounded-full bg-primary" />
												)}
											</div>
											<div className="flex items-center gap-3">
												<Truck className="size-5 text-muted-foreground" />
												<div>
													<span className="font-medium">Outside Dhaka</span>
													<p className="text-sm text-muted-foreground">
														Delivery outside Dhaka city limits
													</p>
												</div>
											</div>
										</div>
										<span className="font-semibold">৳120</span>
									</div>
								</div>
							</div>
							{form.formState.errors.delivery_type && (
								<p className="text-sm text-red-600">
									{form.formState.errors.delivery_type.message}
								</p>
							)}
						</section>

						<Separator />

						{/* Payment Method - COD Only */}
						<section className="space-y-4">
							<h2 className="text-xl font-semibold">Payment Method</h2>
							<p className="text-sm text-muted-foreground">
								All transactions are secure and encrypted.
							</p>

							<div className="border rounded-lg p-4 bg-muted/30">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-3">
										<div className="w-4 h-4 rounded-full border border-primary flex items-center justify-center">
											<div className="w-2 h-2 rounded-full bg-primary" />
										</div>
										<div>
											<span className="font-medium">
												Cash on Delivery (COD)
											</span>
											<p className="text-sm text-muted-foreground">
												Pay when you receive your order
											</p>
										</div>
									</div>
								</div>
							</div>
						</section>

						{/* Coupon Code */}
						<section className="space-y-4">
							<h2 className="text-xl font-semibold flex items-center gap-2">
								<Tag className="size-5" />
								Discount Code
							</h2>
							{appliedCoupon ? (
								<div className="flex items-center justify-between bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3">
									<div className="flex items-center gap-2">
										<Check className="size-4 text-green-600" />
										<span className="font-mono font-semibold text-green-700 dark:text-green-400">
											{appliedCoupon.code}
										</span>
										<span className="text-sm text-green-600 dark:text-green-400">
											(-৳
											{parseFloat(
												appliedCoupon.discount_amount
											).toFixed(2)}
											)
										</span>
									</div>
									<button
										type="button"
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
												setCouponCode(
													e.target.value.toUpperCase()
												);
												setCouponError("");
											}}
											onKeyDown={(e) => {
												if (e.key === "Enter") {
													e.preventDefault();
													handleApplyCoupon();
												}
											}}
											className={
												couponError ? "border-red-500" : ""
											}
										/>
										<Button
											type="button"
											variant="outline"
											onClick={handleApplyCoupon}
											disabled={
												couponLoading || !couponCode.trim()
											}
										>
											{couponLoading ? (
												<Loader2 className="size-4 animate-spin" />
											) : (
												"Apply"
											)}
										</Button>
									</div>
									{couponError && (
										<p className="text-sm text-red-500 mt-2">
											{couponError}
										</p>
									)}
								</div>
							)}
						</section>

						<Separator />

						{/* Order Notes */}
						<section className="space-y-4">
							<h2 className="text-xl font-semibold">Order Notes (Optional)</h2>
							<div className="space-y-2">
								<textarea
									{...form.register("customer_note")}
									placeholder="Any special instructions for delivery..."
									className="w-full min-h-[100px] p-3 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									rows={4}
								/>
								{form.formState.errors.customer_note && (
									<p className="text-sm text-red-600">
										{form.formState.errors.customer_note.message}
									</p>
								)}
							</div>
						</section>

						<LoadingButton
							type="submit"
							size="lg"
							className="w-full text-lg h-12"
							isLoading={createOrder.isPending}
						>
							{createOrder.isPending ? "Processing Order..." : `Place Order`}
						</LoadingButton>
					</div>

					{/* Right Column: Order Summary */}
					<div className="lg:col-span-1">
						<div className="sticky top-24 border rounded-xl bg-muted/30 p-6 space-y-6">
							<h3 className="font-semibold text-lg">Order Summary</h3>

							<div className="space-y-4">
								{items.map((item) => (
									<div key={item.id} className="flex gap-4">
										<div className="relative w-16 h-16 rounded-md border bg-background overflow-hidden shrink-0">
											{/* eslint-disable-next-line @next/next/no-img-element */}
											<img
												src={getImageUrl(item.product.primary_image)}
												alt={item.product.name}
												className="w-full h-full object-cover"
											/>
											<Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
												{item.quantity}
											</Badge>
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium line-clamp-2">
												{item.product.name}
											</p>
											<p className="text-sm text-muted-foreground">
												৳{item.product.price}
											</p>
										</div>
										<div className="text-sm font-medium">৳{item.subtotal}</div>
									</div>
								))}
							</div>

							<Separator />

							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span className="text-muted-foreground">
										Subtotal ({cart?.total_items || 0} items)
									</span>
									<span>৳{subtotal.toFixed(2)}</span>
								</div>
								{discount > 0 && (
									<div className="flex justify-between text-green-600">
										<span>Discount ({appliedCoupon?.code})</span>
										<span>-৳{discount.toFixed(2)}</span>
									</div>
								)}
								<div className="flex justify-between">
									<span className="text-muted-foreground">Shipping</span>
									<span>
										{shipping === 0 ? (
											<span className="text-green-600">FREE</span>
										) : (
											`৳${shipping}`
										)}
									</span>
								</div>
								{tax > 0 && (
									<div className="flex justify-between">
										<span className="text-muted-foreground">Tax</span>
										<span>৳{tax.toFixed(2)}</span>
									</div>
								)}
								{subtotal < 1000 && (
									<div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
										Add ৳{(1000 - subtotal).toFixed(2)} more for free shipping!
									</div>
								)}
							</div>

							<Separator />

							<div className="flex justify-between items-center">
								<span className="font-bold text-lg">Total</span>
								<div className="text-right">
									<span className="text-xs text-muted-foreground block font-normal">
										BDT
									</span>
									<span className="font-bold text-xl">
										৳{total.toFixed(2)}
									</span>
								</div>
							</div>

							<div className="flex items-center gap-2 text-xs text-muted-foreground justify-center pt-4">
								<ShieldCheck className="size-4" />
								Secure Checkout
								<span className="mx-1">•</span>
								<Lock className="size-4" />
								Encrypted Data
							</div>
						</div>
					</div>
				</div>
			</BaseForm>

			{/* Guest Order Success Modal */}
			<GuestOrderSuccessModal
				isOpen={showGuestSuccessModal}
				onClose={() => setShowGuestSuccessModal(false)}
				orderNumber={guestOrderNumber}
			/>
		</div>
	);
}
