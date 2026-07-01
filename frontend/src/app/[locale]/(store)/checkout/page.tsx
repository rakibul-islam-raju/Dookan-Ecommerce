"use client";

import type { ICreateOrderRequest } from "@/@types/Order";
import { GuestOrderSuccessModal } from "@/components/GuestOrderSuccessModal";
import { BaseForm } from "@/components/ui/@form/BaseForm";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { Separator } from "@/components/ui/separator";
import { useZodForm } from "@/hooks/useZodForm";
import { Link, useRouter } from "@/i18n/navigation";
import { useCart } from "@/lib/hooks/useCart";
import {
	generateMetaEventId,
	initMetaPixel,
	trackMetaInitiateCheckout,
	trackMetaPurchase,
} from "@/lib/meta";
import { useCreateOrder } from "@/lib/hooks/useOrders";
import { useSiteConfig } from "@/lib/hooks/useStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import type { CouponValidateResponse } from "@/lib/api/coupons";
import { couponClientApi } from "@/lib/api/coupons";
import { ArrowLeft, Loader2, Truck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { createCheckoutSchema } from "./_types";
import type { CheckoutFormValues } from "./_types";
import { CheckoutContactInfo } from "./_components/CheckoutContactInfo";
import { CheckoutCoupon } from "./_components/CheckoutCoupon";
import { CheckoutDeliveryArea } from "./_components/CheckoutDeliveryArea";
import { CheckoutOrderNotes } from "./_components/CheckoutOrderNotes";
import { CheckoutOrderSummary } from "./_components/CheckoutOrderSummary";
import { CheckoutPaymentMethod } from "./_components/CheckoutPaymentMethod";
import { CheckoutShippingAddress } from "./_components/CheckoutShippingAddress";

export default function CheckoutPage() {
	return (
		<Suspense fallback={<div className="container py-10" />}>
			<CheckoutPageInner />
		</Suspense>
	);
}

function CheckoutPageInner() {
	const t = useTranslations("checkoutPage");
	const router = useRouter();
	const searchParams = useSearchParams();

	const user = useAuthStore((state) => state.user);
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

	const { data: cart, isLoading: cartLoading } = useCart();
	const createOrder = useCreateOrder();
	const { data: siteConfig } = useSiteConfig();

	const [couponCode, setCouponCode] = useState(
		searchParams.get("coupon") || ""
	);
	const [couponLoading, setCouponLoading] = useState(false);
	const [couponError, setCouponError] = useState("");
	const [appliedCoupon, setAppliedCoupon] =
		useState<CouponValidateResponse | null>(null);
	const [selectedDeliveryType, setSelectedDeliveryType] = useState<
		"inside_dhaka" | "outside_dhaka"
	>("inside_dhaka");
	const [showGuestSuccessModal, setShowGuestSuccessModal] = useState(false);
	const [guestOrderNumber, setGuestOrderNumber] = useState<
		string | undefined
	>();

	const checkoutSchema = useMemo(() => createCheckoutSchema(t), [t]);
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

	const items = cart?.items || [];
	const subtotal = cart?.subtotal || 0;
	const discount = appliedCoupon
		? parseFloat(appliedCoupon.discount_amount)
		: 0;

	const insideDhakaCharge = parseFloat(
		siteConfig?.inside_dhaka_delivery_charge ?? "60"
	);
	const outsideDhakaCharge = parseFloat(
		siteConfig?.outside_dhaka_delivery_charge ?? "120"
	);
	const freeShippingThreshold = parseFloat(
		siteConfig?.free_shipping_threshold ?? "1000"
	);
	const taxRate = parseFloat(siteConfig?.tax_rate ?? "0");
	const metaCurrency = siteConfig?.meta_default_currency || "BDT";
	const hasTrackedCheckoutRef = useRef(false);

	const baseShipping =
		selectedDeliveryType === "inside_dhaka" ? insideDhakaCharge : outsideDhakaCharge;
	const shipping =
		freeShippingThreshold > 0 && subtotal >= freeShippingThreshold
			? 0
			: baseShipping;
	const tax = (subtotal - discount) * (taxRate / 100);
	const total = subtotal - discount + shipping + tax;

	const handleDeliveryTypeChange = (type: "inside_dhaka" | "outside_dhaka") => {
		setSelectedDeliveryType(type);
		form.setValue("delivery_type", type);
	};

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
				axiosErr?.response?.data?.code?.[0] || t("invalidCouponCode");
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

	const handleSubmitOrder = async (data: CheckoutFormValues) => {
		if (!cart || items.length === 0) return;

		const orderData: ICreateOrderRequest = {
			customer_name: data.customer_name,
			customer_email: data.customer_email || undefined,
			guest_mobile_number: data.guest_mobile_number,
			payment_method: "cod",
			delivery_type: data.delivery_type,
			meta_event_id: generateMetaEventId(),
			customer_note: data.customer_note || undefined,
			coupon_code: appliedCoupon?.code || undefined,
			items: items.map((item) => ({
				product_id: item.product.id,
				variant_id: item.variant.id,
				quantity: item.quantity,
			})),
			shipping_address: {
				full_name: data.customer_name,
				mobile_number: data.mobile_number,
				address_line1: data.address_line1,
				address_line2: data.address_line2 || undefined,
				city: data.city,
				state: data.city,
				postal_code: data.postal_code,
				country: "Bangladesh",
			},
		};

		try {
			const result = await createOrder.mutateAsync(orderData);
			if (orderData.meta_event_id) {
				if (siteConfig?.meta_pixel_enabled && siteConfig.meta_pixel_id) {
					initMetaPixel(siteConfig.meta_pixel_id);
				}
				trackMetaPurchase(result, metaCurrency, orderData.meta_event_id);
			}
			if (!isAuthenticated) {
				setGuestOrderNumber(result.order_number);
				setShowGuestSuccessModal(true);
			} else {
				router.push(`/orders/${result.id}`);
			}
		} catch (error) {
			const axiosErr = error as {
				response?: { data?: { coupon_code?: string[] } };
			};
			const couponStakingError = axiosErr?.response?.data?.coupon_code?.[0];
			if (couponStakingError) {
				setCouponError(couponStakingError);
				setAppliedCoupon(null);
				setCouponCode("");
			}
			console.error("Order creation failed:", error);
		}
	};

	useEffect(() => {
		const couponParam = searchParams.get("coupon");
		if (couponParam && subtotal > 0 && !appliedCoupon) {
			setCouponCode(couponParam);
			couponClientApi
				.validate({ code: couponParam, subtotal })
				.then((result) => setAppliedCoupon(result))
				.catch(() => {});
		}
	}, [searchParams, subtotal]);

	useEffect(() => {
		if (hasTrackedCheckoutRef.current || items.length === 0) return;
		if (siteConfig?.meta_pixel_enabled && siteConfig.meta_pixel_id) {
			initMetaPixel(siteConfig.meta_pixel_id);
		}
		trackMetaInitiateCheckout({
			items,
			value: total,
			currency: metaCurrency,
		});
		hasTrackedCheckoutRef.current = true;
	}, [items, total, metaCurrency, siteConfig?.meta_pixel_enabled, siteConfig?.meta_pixel_id]);

	useEffect(() => {
		if (user) {
			form.setValue("customer_name", user.first_name + " " + user.last_name);
			form.setValue("customer_email", user.email);
			form.setValue("address_line1", user.default_address?.address_line1 || "");
			form.setValue("address_line2", user.default_address?.address_line2 || "");
			form.setValue("city", user.default_address?.city || "");
			form.setValue("postal_code", user.default_address?.postal_code || "");
			form.setValue("mobile_number", user.default_address?.mobile_number || "");
			form.setValue("guest_mobile_number", user.mobile_number || "");
		}
	}, [user, form]);

	if (cartLoading) {
		return (
			<div className="container py-20 flex flex-col items-center justify-center text-center space-y-6">
				<div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
					<Loader2 className="size-12 text-muted-foreground animate-spin" />
				</div>
				<div className="space-y-2">
					<h1 className="text-3xl font-bold font-serif">{t("loadingTitle")}</h1>
					<p className="text-muted-foreground max-w-md mx-auto">
						{t("loadingDescription")}
					</p>
				</div>
			</div>
		);
	}

	if (!cart || items.length === 0) {
		return (
			<div className="container py-20 flex flex-col items-center justify-center text-center space-y-6">
				<div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
					<Truck className="size-12 text-muted-foreground" />
				</div>
				<div className="space-y-2">
					<h1 className="text-3xl font-bold font-serif">{t("emptyTitle")}</h1>
					<p className="text-muted-foreground max-w-md mx-auto">
						{t("emptyDescription")}
					</p>
				</div>
				<Link href="/">
					<Button size="lg">{t("continueShopping")}</Button>
				</Link>
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
					<ArrowLeft className="size-4 mr-1" /> {t("backToCart")}
				</Link>
				<h1 className="text-3xl font-bold font-serif mt-4">{t("title")}</h1>
			</div>

			<BaseForm form={form} onSubmit={handleSubmitOrder}>
				<div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
					{/* Left Column: Forms */}
					<div className="lg:col-span-2 space-y-8">
						<CheckoutContactInfo isAuthenticated={isAuthenticated} />
						<Separator />
						<CheckoutShippingAddress
							isAuthenticated={!!user}
							hasDefaultAddress={!!user?.default_address?.address_line1}
						/>
						<Separator />
						<CheckoutDeliveryArea
							selectedDeliveryType={selectedDeliveryType}
							onDeliveryTypeChange={handleDeliveryTypeChange}
							error={form.formState.errors.delivery_type}
							insideDhakaCharge={insideDhakaCharge}
							outsideDhakaCharge={outsideDhakaCharge}
						/>
						<Separator />
						<CheckoutPaymentMethod />
						<CheckoutCoupon
							couponCode={couponCode}
							setCouponCode={setCouponCode}
							couponLoading={couponLoading}
							couponError={couponError}
							setCouponError={setCouponError}
							appliedCoupon={appliedCoupon}
							onApply={handleApplyCoupon}
							onRemove={handleRemoveCoupon}
						/>
						<Separator />
						<CheckoutOrderNotes />
						<LoadingButton
							type="submit"
							size="lg"
							className="w-full text-lg h-12"
							isLoading={createOrder.isPending}
						>
							{createOrder.isPending ? t("processingOrder") : t("placeOrder")}
						</LoadingButton>
					</div>

					{/* Right Column: Order Summary */}
					<div className="lg:col-span-1">
						<CheckoutOrderSummary
							cart={cart}
							subtotal={subtotal}
							discount={discount}
							shipping={shipping}
							tax={tax}
							total={total}
							appliedCoupon={appliedCoupon}
							freeShippingThreshold={freeShippingThreshold}
						/>
					</div>
				</div>
			</BaseForm>

			<GuestOrderSuccessModal
				isOpen={showGuestSuccessModal}
				onClose={() => setShowGuestSuccessModal(false)}
				orderNumber={guestOrderNumber}
			/>
		</div>
	);
}
