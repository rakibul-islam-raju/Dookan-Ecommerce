import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { env } from "@/config/env";
import type { CouponValidateResponse } from "@/lib/api/coupons";
import type { Cart } from "@/lib/api";
import { Lock, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

interface CheckoutOrderSummaryProps {
	cart: Cart;
	subtotal: number;
	discount: number;
	shipping: number;
	tax: number;
	total: number;
	appliedCoupon: CouponValidateResponse | null;
	freeShippingThreshold: number;
}

function getImageUrl(image?: string) {
	if (!image) return "";
	if (image.startsWith("http")) return image;
	return `${env.api.baseAppUrl}${image.startsWith("/") ? "" : "/"}${image}`;
}

export function CheckoutOrderSummary({
	cart,
	subtotal,
	discount,
	shipping,
	tax,
	total,
	appliedCoupon,
	freeShippingThreshold,
}: CheckoutOrderSummaryProps) {
	const t = useTranslations("checkoutPage");
	const items = cart.items;

	return (
		<div className="sticky top-24 border rounded-xl bg-muted/30 p-6 space-y-6">
			<h3 className="font-semibold text-lg">{t("orderSummary")}</h3>

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
						{t("subtotal", { count: cart.total_items || 0 })}
					</span>
					<span>৳{subtotal.toFixed(2)}</span>
				</div>
				{discount > 0 && (
					<div className="flex justify-between text-green-600">
						<span>{t("discount", { code: appliedCoupon?.code ?? "" })}</span>
						<span>-৳{discount.toFixed(2)}</span>
					</div>
				)}
				<div className="flex justify-between">
					<span className="text-muted-foreground">{t("shipping")}</span>
					<span>
						{shipping === 0 ? (
							<span className="text-green-600">{t("free")}</span>
						) : (
							`৳${shipping}`
						)}
					</span>
				</div>
				{tax > 0 && (
					<div className="flex justify-between">
						<span className="text-muted-foreground">{t("tax")}</span>
						<span>৳{tax.toFixed(2)}</span>
					</div>
				)}
				{freeShippingThreshold > 0 && subtotal < freeShippingThreshold && (
					<div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
						{t("freeShippingPrompt", {
							amount: (freeShippingThreshold - subtotal).toFixed(2),
						})}
					</div>
				)}
			</div>

			<Separator />

			<div className="flex justify-between items-center">
				<span className="font-bold text-lg">{t("total")}</span>
				<div className="text-right">
					<span className="text-xs text-muted-foreground block font-normal">
						BDT
					</span>
					<span className="font-bold text-xl">৳{total.toFixed(2)}</span>
				</div>
			</div>

			<div className="flex items-center gap-2 text-xs text-muted-foreground justify-center pt-4">
				<ShieldCheck className="size-4" />
				{t("secureCheckout")}
				<span className="mx-1">•</span>
				<Lock className="size-4" />
				{t("encryptedData")}
			</div>
		</div>
	);
}
