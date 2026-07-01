"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/navigation";
import { orderClientApi } from "@/lib/api/orders";
import { downloadBlob, getInvoiceFileName } from "@/lib/download";
import { useOrder } from "@/lib/hooks/useOrders";
import { cn } from "@/lib/utils";
import {
	ArrowLeft,
	CheckCircle2,
	CreditCard,
	FileDown,
	Loader2,
	MapPin,
	Package,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "react-toastify";

// Helper function to get image URL
const getImageUrl = (image?: string) => {
	if (!image) return "";
	if (image.startsWith("http")) return image;
	const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
	const origin = baseUrl.replace(/\/api\/?$/, "");
	return `${origin}${image.startsWith("/") ? "" : "/"}${image}`;
};

const getStatusColor = (status: import("@/@types/Order").IOrderStatus) => {
	switch (status) {
		case "pending":
			return "bg-yellow-500/15 text-yellow-700 border-yellow-200";
		case "confirmed":
			return "bg-violet-500/15 text-violet-700 border-violet-200";
		case "processing":
			return "bg-blue-500/15 text-blue-700 border-blue-200";
		case "shipped":
			return "bg-purple-500/15 text-purple-700 border-purple-200";
		case "delivered":
			return "bg-green-500/15 text-green-700 border-green-200";
		case "cancelled":
			return "bg-red-500/15 text-red-700 border-red-200";
		default:
			return "bg-gray-100 text-gray-800";
	}
};

const getStatusStep = (status: import("@/@types/Order").IOrderStatus) => {
	const steps = ["pending", "confirmed", "processing", "shipped", "delivered"];
	const index = steps.indexOf(status);
	return index === -1 ? 0 : index + 1;
};

export default function OrderDetailsPage() {
	const t = useTranslations("orders");
	const locale = useLocale();
	const params = useParams();
	const orderId = params.id as string;

	const { data: order, isLoading, error } = useOrder(orderId);
	const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);

	if (isLoading) {
		return (
			<div className="max-w-5xl mx-auto py-20 flex flex-col items-center justify-center text-center space-y-6">
				<div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
					<Loader2 className="size-12 text-muted-foreground animate-spin" />
				</div>
				<div className="space-y-2">
					<h1 className="text-3xl font-bold font-serif">
						{t("loadingDetails")}
					</h1>
					<p className="text-muted-foreground max-w-md mx-auto">
						{t("loadingDetailsDescription")}
					</p>
				</div>
			</div>
		);
	}

	if (error || !order) {
		return (
			<div className="max-w-5xl mx-auto py-20 flex flex-col items-center justify-center text-center space-y-6">
				<div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
					<div className="w-12 h-12 text-red-600">⚠️</div>
				</div>
				<div className="space-y-2">
					<h1 className="text-3xl font-bold font-serif">{t("notFound")}</h1>
					<p className="text-muted-foreground max-w-md mx-auto">
						{t("notFoundDescription")}
					</p>
				</div>
				<Link href="/orders">
					<Button>{t("backToOrders")}</Button>
				</Link>
			</div>
		);
	}

	const currentStep = getStatusStep(order.status);
	const progressSteps = [
		t("orderPlaced"),
		t("confirmed"),
		t("processing"),
		t("shipped"),
		t("delivered"),
	];
	const formatCurrency = (value: string | number) =>
		`৳${Number(value).toLocaleString(locale === "bn" ? "bn-BD" : "en-BD", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})}`;
	const formatDate = (dateString: string) =>
		new Date(dateString).toLocaleDateString(locale, {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "numeric",
			minute: "numeric",
		});
	const getPaymentMethodLabel = (method: string) =>
		method === "cod" ? t("cashOnDelivery") : method;
	const handleDownloadInvoice = async () => {
		setIsDownloadingInvoice(true);
		try {
			const invoice = await orderClientApi.downloadInvoice(order.id);
			downloadBlob(invoice, getInvoiceFileName(order.order_number));
		} catch (downloadError) {
			console.error(downloadError);
			toast.error(t("downloadInvoiceFailed"));
		} finally {
			setIsDownloadingInvoice(false);
		}
	};

	return (
		<div className="max-w-5xl">
			<div className="mb-8">
				<Link
					href="/orders"
					className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
				>
					<ArrowLeft className="size-4 mr-1" /> {t("backToOrders")}
				</Link>
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
					<div>
						<h1 className="text-3xl font-bold font-serif flex items-center gap-3">
							{t("orderHeading", { number: order.order_number })}
							<Badge
								variant="outline"
								className={cn(
									"text-sm font-normal capitalize py-1 px-3",
									getStatusColor(order.status)
								)}
							>
								{t(`orderStatus.${order.status}`)}
							</Badge>
						</h1>
						<p className="text-muted-foreground mt-1">
							{t("placedOn", { date: formatDate(order.created_at) })}
						</p>
						<p className="text-sm text-muted-foreground mt-1">
							{t("customer", { name: order.customer_name })}
							{order.customer_email && ` • ${order.customer_email}`}
						</p>
					</div>
					{order.status !== "cancelled" && (
						<Button
							variant="outline"
							onClick={handleDownloadInvoice}
							disabled={isDownloadingInvoice}
						>
							{isDownloadingInvoice ? (
								<Loader2 className="size-4 mr-2 animate-spin" />
							) : (
								<FileDown className="size-4 mr-2" />
							)}
							{t("downloadInvoice")}
						</Button>
					)}
				</div>
			</div>

			{/* Order Progress (Simple Visualization) */}
			{order.status !== "cancelled" && order.status !== "returned" && (
				<div className="mb-10 p-6 border rounded-xl bg-card/50">
					<div className="relative flex justify-between">
						{/* Progress Bar Background */}
						<div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2 z-0" />

						{/* Active Progress Bar */}
						<div
							className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
							style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
						/>

						{/* Steps */}
						{progressSteps.map(
							(step, index) => {
								const isCompleted = index + 1 <= currentStep;
								const isCurrent = index + 1 === currentStep;

								return (
									<div
										key={step}
										className="relative z-10 flex flex-col items-center gap-2"
									>
										<div
											className={cn(
												"w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors bg-background",
												isCompleted
													? "border-primary bg-primary text-primary-foreground"
													: "border-muted text-muted-foreground",
												isCurrent && "ring-4 ring-primary/20"
											)}
										>
											{isCompleted ? (
												<CheckCircle2 className="size-5" />
											) : (
												<span className="text-xs font-medium">{index + 1}</span>
											)}
										</div>
										<span
											className={cn(
												"text-xs font-medium hidden md:block",
												isCompleted ? "text-primary" : "text-muted-foreground"
											)}
										>
											{step}
										</span>
									</div>
								);
							}
						)}
					</div>
				</div>
			)}

			{/* Customer Note */}
			{order.customer_note && (
				<div className="border rounded-xl bg-card p-6">
					<h3 className="font-semibold text-lg mb-3">{t("orderNotes")}</h3>
					<p className="text-muted-foreground">{order.customer_note}</p>
				</div>
			)}

			<div className="grid md:grid-cols-3 gap-8">
				{/* Left Column: Items */}
				<div className="md:col-span-2 space-y-6">
					<div className="border rounded-xl overflow-hidden bg-card">
						<div className="p-4 bg-muted/30 border-b font-medium">
							{t("orderItems", { count: order.items.length })}
						</div>
						<div className="divide-y">
							{order.items.map((item) => (
								<div key={item.id} className="p-4 flex gap-4">
									<div className="h-20 w-20 rounded-lg border bg-muted overflow-hidden shrink-0">
										{item.product_details.image ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img
												src={getImageUrl(item.product_details.image)}
												alt={item.product_name}
												className="w-full h-full object-cover"
											/>
										) : (
											<div className="flex h-full w-full items-center justify-center">
												<Package className="size-8 text-muted-foreground" />
											</div>
										)}
									</div>
									<div className="flex-1 min-w-0">
										<Link
											href={`/products/${item.product_details.slug}`}
											className="font-medium hover:text-primary transition-colors line-clamp-2"
										>
											{item.product_name}
										</Link>
										<p className="text-sm text-muted-foreground mt-1">
											{t("quantityPrice", {
												quantity: item.quantity,
												price: parseFloat(item.unit_price).toFixed(2),
											})}
										</p>
									</div>
									<div className="text-right font-medium">
										{formatCurrency(item.total_price)}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Right Column: Summary & Info */}
				<div className="space-y-6">
					{/* Order Summary */}
					<div className="border rounded-xl bg-card p-6 space-y-4">
						<h3 className="font-semibold text-lg">{t("orderSummary")}</h3>
						<div className="space-y-2 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">{t("subtotal")}</span>
								<span>{formatCurrency(order.subtotal)}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">{t("shipping")}</span>
								<span>{formatCurrency(order.shipping_amount)}</span>
							</div>
							{parseFloat(order.discount_amount) > 0 && (
								<div className="flex justify-between">
									<span className="text-muted-foreground">{t("discount")}</span>
									<span className="text-green-600">
										-{formatCurrency(order.discount_amount)}
									</span>
								</div>
							)}
							{parseFloat(order.tax_amount) > 0 && (
								<div className="flex justify-between">
									<span className="text-muted-foreground">{t("tax")}</span>
									<span>{formatCurrency(order.tax_amount)}</span>
								</div>
							)}
							<Separator className="my-2" />
							<div className="flex justify-between font-bold text-lg">
								<span>{t("total")}</span>
								<span>{formatCurrency(order.total_amount)}</span>
							</div>
						</div>
					</div>

					{/* Shipping Details */}
					<div className="border rounded-xl bg-card p-6 space-y-4">
						<h3 className="font-semibold flex items-center gap-2">
							<MapPin className="size-4 text-primary" /> {t("shippingAddress")}
						</h3>
						<address className="not-italic text-sm text-muted-foreground leading-relaxed">
							<span className="font-medium text-foreground block mb-1">
								{order.shipping_address.full_name}
							</span>
							{order.shipping_address.address_line1}
							{order.shipping_address.address_line2 && (
								<>
									<br />
									{order.shipping_address.address_line2}
								</>
							)}
							<br />
							{order.shipping_address.city}, {order.shipping_address.state}{" "}
							{order.shipping_address.postal_code}
							<br />
							{order.shipping_address.country}
						</address>
					</div>

					{/* Payment Details */}
					<div className="border rounded-xl bg-card p-6 space-y-4">
						<h3 className="font-semibold flex items-center gap-2">
							<CreditCard className="size-4 text-primary" /> {t("paymentMethod")}
						</h3>
						<p className="text-sm text-muted-foreground capitalize">
							{getPaymentMethodLabel(order.payment_method)}
						</p>
						<div className="flex items-center gap-2 text-sm">
							<span className="text-muted-foreground">{t("statusLabel")}</span>
							<Badge
								variant={
									order.payment_status === "paid" ? "default" : "secondary"
								}
								className="capitalize"
							>
								{t(`paymentStatus.${order.payment_status}`)}
							</Badge>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
