import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useLocale } from "@/i18n/locale-context";
import { T } from "@/i18n/translate";
import { useT } from "@/i18n/use-t";
import {
	getOrderById,
	useCancelOrder,
	useUpdateOrderStatus,
	useUpdatePaymentStatus,
} from "@/lib/api/orders";
import type { IOrderPaymentStatus, IOrderStatus } from "@/@types/Order";
import { useQuery } from "@tanstack/react-query";
import {
	ArrowLeft,
	Loader2,
	Package,
	MapPin,
	Clock,
	User,
	Phone,
	Mail,
	FileText,
	MoreVertical,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const ORDER_STATUSES: { value: IOrderStatus; label: string }[] = [
	{ value: "pending", label: "Pending" },
	{ value: "confirmed", label: "Confirmed" },
	{ value: "processing", label: "Processing" },
	{ value: "shipped", label: "Shipped" },
	{ value: "delivered", label: "Delivered" },
	{ value: "cancelled", label: "Cancelled" },
	{ value: "refunded", label: "Refunded" },
];

const PAYMENT_STATUSES: { value: IOrderPaymentStatus; label: string }[] = [
	{ value: "pending", label: "Pending" },
	{ value: "paid", label: "Paid" },
	{ value: "failed", label: "Failed" },
	{ value: "refunded", label: "Refunded" },
];

const getStatusBadgeVariant = (
	status: IOrderStatus
): "default" | "secondary" | "destructive" | "success" | "warning" | "info" | "purple" | "cyan" => {
	switch (status) {
		case "pending":
			return "warning";
		case "confirmed":
			return "purple";
		case "processing":
			return "info";
		case "shipped":
			return "cyan";
		case "delivered":
			return "success";
		case "cancelled":
			return "destructive";
		case "refunded":
			return "secondary";
		default:
			return "default";
	}
};

const getPaymentStatusBadgeVariant = (
	status: IOrderPaymentStatus
): "default" | "secondary" | "destructive" | "success" | "warning" | "info" => {
	switch (status) {
		case "pending":
			return "warning";
		case "paid":
			return "success";
		case "failed":
			return "destructive";
		case "refunded":
			return "info";
		default:
			return "default";
	}
};

const formatPaymentMethod = (method: string) => {
	switch (method) {
		case "cod":
			return "Cash on Delivery";
		case "online":
			return "Online Payment";
		case "card":
			return "Card Payment";
		case "upi":
			return "UPI";
		default:
			return method;
	}
};

export const OrderDetails = () => {
	const t = useT();
	const { locale } = useLocale();
	const { id } = useParams();
	const navigate = useNavigate();

	// Dialog states
	const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
	const [isPaymentStatusDialogOpen, setIsPaymentStatusDialogOpen] =
		useState(false);
	const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

	// Form states
	const [selectedStatus, setSelectedStatus] = useState<IOrderStatus | "">("");
	const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<
		IOrderPaymentStatus | ""
	>("");
	const [statusNote, setStatusNote] = useState("");
	const [cancelNote, setCancelNote] = useState("");

	const { data: order, isPending: isLoadingOrder } = useQuery(
		getOrderById(id!)
	);

	const { mutate: updateOrderStatus, isPending: isUpdatingStatus } =
		useUpdateOrderStatus();
	const { mutate: updatePaymentStatus, isPending: isUpdatingPaymentStatus } =
		useUpdatePaymentStatus();
	const { mutate: cancelOrder, isPending: isCancellingOrder } =
		useCancelOrder();

	const getStatusLabel = (status: IOrderStatus) =>
		t(`orders.common.status.${status}`, status.charAt(0).toUpperCase() + status.slice(1));

	const getPaymentStatusLabel = (status: IOrderPaymentStatus) =>
		t(
			`orders.common.payment.${status}`,
			status.charAt(0).toUpperCase() + status.slice(1),
		);

	const formatCurrency = (value: string | number) =>
		`৳${Number(value).toLocaleString(locale === "bn" ? "bn-BD" : "en-BD", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})}`;

	const formatDateLocalized = (dateString: string) =>
		new Date(dateString).toLocaleDateString(locale === "bn" ? "bn-BD" : "en-BD", {
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});

	const getPaymentMethodLabel = (method: string) => {
		switch (method) {
			case "cod":
				return t("orders.common.paymentMethod.cod", "Cash on Delivery");
			case "online":
				return t("orders.common.paymentMethod.online", "Online Payment");
			case "card":
				return t("orders.common.paymentMethod.card", "Card Payment");
			case "upi":
				return t("orders.common.paymentMethod.upi", "UPI");
			default:
				return formatPaymentMethod(method);
		}
	};

	const handleBack = () => {
		navigate("/orders");
	};

	const handleOpenStatusDialog = () => {
		if (order) {
			setSelectedStatus(order.status);
			setStatusNote("");
		}
		setIsStatusDialogOpen(true);
	};

	const handleOpenPaymentStatusDialog = () => {
		if (order) {
			setSelectedPaymentStatus(order.payment_status);
			setStatusNote("");
		}
		setIsPaymentStatusDialogOpen(true);
	};

	const handleOpenCancelDialog = () => {
		setCancelNote("");
		setIsCancelDialogOpen(true);
	};

	const handleUpdateStatus = () => {
		if (!selectedStatus || !id) return;

		updateOrderStatus(
			{
				orderId: id,
				status: selectedStatus,
				note: statusNote || undefined,
			},
			{
				onSuccess: () => {
					toast.success(
						t(
							"orders.details.toast.statusUpdated",
							"Order status updated successfully",
						),
					);
					setIsStatusDialogOpen(false);
					setSelectedStatus("");
					setStatusNote("");
				},
				onError: (error) => {
					toast.error(
						t("orders.details.toast.statusFailed", "Failed to update order status"),
					);
					console.error(error);
				},
			}
		);
	};

	const handleUpdatePaymentStatus = () => {
		if (!selectedPaymentStatus || !id) return;

		updatePaymentStatus(
			{
				orderId: id,
				paymentStatus: selectedPaymentStatus,
				note: statusNote || undefined,
			},
			{
				onSuccess: () => {
					toast.success(
						t(
							"orders.details.toast.paymentUpdated",
							"Payment status updated successfully",
						),
					);
					setIsPaymentStatusDialogOpen(false);
					setSelectedPaymentStatus("");
					setStatusNote("");
				},
				onError: (error) => {
					toast.error(
						t(
							"orders.details.toast.paymentFailed",
							"Failed to update payment status",
						),
					);
					console.error(error);
				},
			}
		);
	};

	const handleCancelOrder = () => {
		if (!id) return;

		cancelOrder(
			{
				orderId: id,
				note: cancelNote || undefined,
			},
			{
				onSuccess: () => {
					toast.success(
						t("orders.details.toast.cancelled", "Order cancelled successfully"),
					);
					setIsCancelDialogOpen(false);
					setCancelNote("");
				},
				onError: (error) => {
					toast.error(
						t("orders.details.toast.cancelFailed", "Failed to cancel order"),
					);
					console.error(error);
				},
			}
		);
	};

	if (isLoadingOrder) {
		return (
			<div className="flex justify-center items-center h-full min-h-[400px]">
				<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!order) {
		return (
			<div className="flex flex-col justify-center items-center h-full min-h-[400px] gap-4">
				<Package className="h-12 w-12 text-muted-foreground" />
				<p className="text-muted-foreground">
					<T id="orders.details.notFound" defaultMessage="Order not found" />
				</p>
				<Button onClick={handleBack} variant="outline" size="sm">
					<ArrowLeft className="h-4 w-4 mr-2" />
					<T id="orders.details.back" defaultMessage="Back to Orders" />
				</Button>
			</div>
		);
	}

	const canCancel = !["cancelled", "delivered", "refunded"].includes(
		order.status
	);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" onClick={handleBack}>
						<ArrowLeft className="h-4 w-4" />
					</Button>
					<div>
						<h1 className="text-2xl font-bold">Order #{order.order_number}</h1>
						<p className="text-sm text-muted-foreground">
							{t("orders.details.placedOn", "Placed on {date}", {
								date: formatDateLocalized(order.created_at),
							})}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Badge variant={getStatusBadgeVariant(order.status)}>
						{getStatusLabel(order.status)}
					</Badge>
					<Badge variant={getPaymentStatusBadgeVariant(order.payment_status)}>
						{t("orders.details.paymentBadge", "Payment: {status}", {
							status: getPaymentStatusLabel(order.payment_status),
						})}
					</Badge>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="outline" size="icon">
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem onClick={handleOpenStatusDialog}>
								<T
									id="orders.details.actions.changeOrderStatus"
									defaultMessage="Change Order Status"
								/>
							</DropdownMenuItem>
							<DropdownMenuItem onClick={handleOpenPaymentStatusDialog}>
								<T
									id="orders.details.actions.changePaymentStatus"
									defaultMessage="Change Payment Status"
								/>
							</DropdownMenuItem>
							{canCancel && (
								<>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										className="text-destructive focus:text-destructive"
										onClick={handleOpenCancelDialog}
									>
										<XCircle className="h-4 w-4 mr-2" />
										<T
											id="orders.details.actions.cancelOrder"
											defaultMessage="Cancel Order"
										/>
									</DropdownMenuItem>
								</>
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Main Content: Left (wider) + Right (sidebar) */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column - Order Items & Customer Info */}
				<div className="lg:col-span-2 space-y-6">
					{/* Order Items */}
					<Card>
						<CardHeader>
							<CardTitle>
								<T id="orders.details.items.title" defaultMessage="Order Items" />
							</CardTitle>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>
											<T id="orders.details.items.product" defaultMessage="Product" />
										</TableHead>
										<TableHead className="text-center">
											<T id="orders.details.items.quantity" defaultMessage="Quantity" />
										</TableHead>
										<TableHead className="text-right">
											<T id="orders.details.items.unitPrice" defaultMessage="Unit Price" />
										</TableHead>
										<TableHead className="text-right">
											<T id="orders.details.items.total" defaultMessage="Total" />
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{order.items.map((item) => (
										<TableRow key={item.id}>
											<TableCell>
												<div className="flex items-center gap-3">
													{item.product_details.image ? (
														<img
															src={item.product_details.image}
															alt={item.product_name}
															className="h-12 w-12 rounded-md object-cover"
														/>
													) : (
														<div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
															<Package className="h-6 w-6 text-muted-foreground" />
														</div>
													)}
													<div>
														<p className="font-medium">{item.product_name}</p>
														<p className="text-sm text-muted-foreground">
															{t("orders.details.items.sku", "SKU: {sku}", {
																sku: item.product_sku,
															})}
														</p>
													</div>
												</div>
											</TableCell>
											<TableCell className="text-center">
												{item.quantity}
											</TableCell>
											<TableCell className="text-right">
												{formatCurrency(item.unit_price)}
											</TableCell>
											<TableCell className="text-right font-medium">
												{formatCurrency(item.total_price)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>

					{/* Shipping Address */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<MapPin className="h-5 w-5" />
								<T
									id="orders.details.shipping.title"
									defaultMessage="Shipping Address"
								/>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex items-center gap-2">
								<User className="h-4 w-4 text-muted-foreground" />
								<span className="font-medium">
									{order.shipping_address.full_name}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<Phone className="h-4 w-4 text-muted-foreground" />
								<span>{order.shipping_address.mobile_number}</span>
							</div>
							<div className="px-3 py-2 bg-muted/50 rounded-md">
								<p>{order.shipping_address.address_line1}</p>
								{order.shipping_address.address_line2 && (
									<p>{order.shipping_address.address_line2}</p>
								)}
								<p>
									{order.shipping_address.city}, {order.shipping_address.state}{" "}
									{order.shipping_address.postal_code}
								</p>
								<p>{order.shipping_address.country}</p>
							</div>
						</CardContent>
					</Card>

					{/* Order Notes */}
					{(order.customer_note || order.admin_note) && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<FileText className="h-5 w-5" />
									<T id="orders.details.notes.title" defaultMessage="Notes" />
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{order.customer_note && (
									<div>
										<p className="text-sm text-muted-foreground mb-1.5">
											<T
												id="orders.details.notes.customer"
												defaultMessage="Customer Note"
											/>
										</p>
										<div className="px-3 py-2 bg-muted/50 rounded-md">
											<p className="text-sm">{order.customer_note}</p>
										</div>
									</div>
								)}
								{order.admin_note && (
									<div>
										<p className="text-sm text-muted-foreground mb-1.5">
											<T
												id="orders.details.notes.admin"
												defaultMessage="Admin Note"
											/>
										</p>
										<div className="px-3 py-2 bg-muted/50 rounded-md">
											<p className="text-sm">{order.admin_note}</p>
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					)}

					{/* Status History */}
					{order.status_history && order.status_history.length > 0 && (
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Clock className="h-5 w-5" />
									<T
										id="orders.details.history.title"
										defaultMessage="Status History"
									/>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{order.status_history.map((history) => (
										<div
											key={history.id}
											className="flex items-start gap-3 pb-4 border-b last:border-b-0 last:pb-0"
										>
											<div className="h-2 w-2 rounded-full bg-primary mt-2" />
											<div className="flex-1">
												<div className="flex items-center justify-between">
													<p className="font-medium capitalize">
														{getStatusLabel(history.status as IOrderStatus)}
													</p>
													<p className="text-sm text-muted-foreground">
														{formatDateLocalized(history.created_at)}
													</p>
												</div>
												{history.note && (
													<p className="text-sm text-muted-foreground mt-1">
														{history.note}
													</p>
												)}
												{history.created_by && (
													<p className="text-xs text-muted-foreground mt-1">
														{t("orders.details.history.by", "By: {name}", {
															name: history.created_by.username,
														})}
													</p>
												)}
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					)}
				</div>

				{/* Right Column - Sidebar */}
				<div className="space-y-6">
					{/* Customer Information */}
					<Card>
						<CardHeader>
							<CardTitle>
								<T
									id="orders.details.customer.title"
									defaultMessage="Customer Information"
								/>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex items-center gap-2">
								<User className="h-4 w-4 text-muted-foreground" />
								<span className="font-medium">{order.customer_name}</span>
							</div>
							{order.customer_email && (
								<div className="flex items-center gap-2">
									<Mail className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm">{order.customer_email}</span>
								</div>
							)}
							{order.guest_mobile_number && (
								<div className="flex items-center gap-2">
									<Phone className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm">{order.guest_mobile_number}</span>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Payment Information */}
					<Card>
						<CardHeader>
							<CardTitle>
								<T
									id="orders.details.payment.title"
									defaultMessage="Payment Details"
								/>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<p className="text-sm text-muted-foreground mb-1.5">
									<T
										id="orders.details.payment.method"
										defaultMessage="Payment Method"
									/>
								</p>
								<div className="px-3 py-2 bg-muted/50 rounded-md">
									<p className="font-medium text-sm">
										{getPaymentMethodLabel(order.payment_method)}
									</p>
								</div>
							</div>
							<div>
								<p className="text-sm text-muted-foreground mb-1.5">
									<T
										id="orders.details.payment.status"
										defaultMessage="Payment Status"
									/>
								</p>
								<Badge
									variant={getPaymentStatusBadgeVariant(order.payment_status)}
								>
									{getPaymentStatusLabel(order.payment_status)}
								</Badge>
							</div>
						</CardContent>
					</Card>

					{/* Order Summary */}
					<Card>
						<CardHeader>
							<CardTitle>
								<T id="orders.details.summary.title" defaultMessage="Order Summary" />
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">
									<T id="orders.details.summary.subtotal" defaultMessage="Subtotal" />
								</span>
								<span>{formatCurrency(order.subtotal)}</span>
							</div>
							{Number(order.discount_amount) > 0 && (
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">
										<T
											id="orders.details.summary.discount"
											defaultMessage="Discount"
										/>
									</span>
									<span className="text-green-600">
										-{formatCurrency(order.discount_amount)}
									</span>
								</div>
							)}
							{Number(order.tax_amount) > 0 && (
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">
										<T id="orders.details.summary.tax" defaultMessage="Tax" />
									</span>
									<span>{formatCurrency(order.tax_amount)}</span>
								</div>
							)}
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">
									<T
										id="orders.details.summary.shipping"
										defaultMessage="Shipping"
									/>
								</span>
								<span>{formatCurrency(order.shipping_amount)}</span>
							</div>
							<div className="border-t pt-3 mt-3">
								<div className="flex justify-between font-medium">
									<span>
										<T id="orders.details.summary.total" defaultMessage="Total" />
									</span>
									<span className="text-lg">
										{formatCurrency(order.total_amount)}
									</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Order Timeline */}
					<Card>
						<CardHeader>
							<CardTitle>
								<T id="orders.details.timeline.title" defaultMessage="Timeline" />
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div>
								<p className="text-sm text-muted-foreground mb-1">
									<T id="orders.details.timeline.created" defaultMessage="Created" />
								</p>
								<p className="text-sm font-medium">
									{formatDateLocalized(order.created_at)}
								</p>
							</div>
							<div>
								<p className="text-sm text-muted-foreground mb-1">
									<T
										id="orders.details.timeline.updated"
										defaultMessage="Last Updated"
									/>
								</p>
								<p className="text-sm font-medium">
									{formatDateLocalized(order.updated_at)}
								</p>
							</div>
							{order.confirmed_at && (
								<div>
									<p className="text-sm text-muted-foreground mb-1">
										{t("orders.common.status.confirmed", "Confirmed")}
									</p>
									<p className="text-sm font-medium">
										{formatDateLocalized(order.confirmed_at)}
									</p>
								</div>
							)}
							{order.shipped_at && (
								<div>
									<p className="text-sm text-muted-foreground mb-1">
										{t("orders.common.status.shipped", "Shipped")}
									</p>
									<p className="text-sm font-medium">
										{formatDateLocalized(order.shipped_at)}
									</p>
								</div>
							)}
							{order.delivered_at && (
								<div>
									<p className="text-sm text-muted-foreground mb-1">
										{t("orders.common.status.delivered", "Delivered")}
									</p>
									<p className="text-sm font-medium">
										{formatDateLocalized(order.delivered_at)}
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Change Order Status Dialog */}
			<Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							<T
								id="orders.details.dialog.status.title"
								defaultMessage="Change Order Status"
							/>
						</DialogTitle>
						<DialogDescription>
							{t(
								"orders.details.dialog.status.description",
								"Update the status of order #{orderNumber}",
								{ orderNumber: order.order_number },
							)}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 pt-4">
						<div className="space-y-2">
							<Label htmlFor="status">
								<T
									id="orders.details.dialog.status.newStatus"
									defaultMessage="New Status"
								/>
							</Label>
							<Select
								value={selectedStatus}
								onValueChange={(value) =>
									setSelectedStatus(value as IOrderStatus)
								}
							>
								<SelectTrigger>
									<SelectValue
										placeholder={t(
											"orders.details.dialog.status.placeholder",
											"Select status",
										)}
									/>
								</SelectTrigger>
								<SelectContent>
									{ORDER_STATUSES.map((status) => (
										<SelectItem key={status.value} value={status.value}>
											{getStatusLabel(status.value)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="note">
								<T
									id="orders.details.dialog.status.note"
									defaultMessage="Note (Optional)"
								/>
							</Label>
							<Textarea
								id="note"
								placeholder={t(
									"orders.details.dialog.status.notePlaceholder",
									"Add a note about this status change...",
								)}
								value={statusNote}
								onChange={(e) => setStatusNote(e.target.value)}
								rows={3}
							/>
						</div>
						<div className="flex justify-end gap-2 pt-2">
							<Button
								variant="outline"
								onClick={() => setIsStatusDialogOpen(false)}
							>
								<T id="common.cancel" defaultMessage="Cancel" />
							</Button>
							<Button
								onClick={handleUpdateStatus}
								disabled={!selectedStatus || isUpdatingStatus}
							>
								{isUpdatingStatus && (
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								)}
								<T
									id="orders.details.dialog.status.submit"
									defaultMessage="Update Status"
								/>
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Change Payment Status Dialog */}
			<Dialog
				open={isPaymentStatusDialogOpen}
				onOpenChange={setIsPaymentStatusDialogOpen}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							<T
								id="orders.details.dialog.payment.title"
								defaultMessage="Change Payment Status"
							/>
						</DialogTitle>
						<DialogDescription>
							{t(
								"orders.details.dialog.payment.description",
								"Update the payment status of order #{orderNumber}",
								{ orderNumber: order.order_number },
							)}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 pt-4">
						<div className="space-y-2">
							<Label htmlFor="payment-status">
								<T
									id="orders.details.dialog.payment.newStatus"
									defaultMessage="New Payment Status"
								/>
							</Label>
							<Select
								value={selectedPaymentStatus}
								onValueChange={(value) =>
									setSelectedPaymentStatus(value as IOrderPaymentStatus)
								}
							>
								<SelectTrigger>
									<SelectValue
										placeholder={t(
											"orders.details.dialog.payment.placeholder",
											"Select payment status",
										)}
									/>
								</SelectTrigger>
								<SelectContent>
									{PAYMENT_STATUSES.map((status) => (
										<SelectItem key={status.value} value={status.value}>
											{getPaymentStatusLabel(status.value)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="payment-note">
								<T
									id="orders.details.dialog.payment.note"
									defaultMessage="Note (Optional)"
								/>
							</Label>
							<Textarea
								id="payment-note"
								placeholder={t(
									"orders.details.dialog.payment.notePlaceholder",
									"Add a note about this payment status change...",
								)}
								value={statusNote}
								onChange={(e) => setStatusNote(e.target.value)}
								rows={3}
							/>
						</div>
						<div className="flex justify-end gap-2 pt-2">
							<Button
								variant="outline"
								onClick={() => setIsPaymentStatusDialogOpen(false)}
							>
								<T id="common.cancel" defaultMessage="Cancel" />
							</Button>
							<Button
								onClick={handleUpdatePaymentStatus}
								disabled={!selectedPaymentStatus || isUpdatingPaymentStatus}
							>
								{isUpdatingPaymentStatus && (
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								)}
								<T
									id="orders.details.dialog.payment.submit"
									defaultMessage="Update Payment Status"
								/>
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>

			{/* Cancel Order Dialog */}
			<Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							<T
								id="orders.details.dialog.cancel.title"
								defaultMessage="Cancel Order"
							/>
						</DialogTitle>
						<DialogDescription>
							{t(
								"orders.details.dialog.cancel.description",
								"Are you sure you want to cancel order #{orderNumber}? This action cannot be undone.",
								{ orderNumber: order.order_number },
							)}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 pt-4">
						<div className="space-y-2">
							<Label htmlFor="cancel-note">
								<T
									id="orders.details.dialog.cancel.reason"
									defaultMessage="Cancellation Reason (Optional)"
								/>
							</Label>
							<Textarea
								id="cancel-note"
								placeholder={t(
									"orders.details.dialog.cancel.reasonPlaceholder",
									"Enter the reason for cancellation...",
								)}
								value={cancelNote}
								onChange={(e) => setCancelNote(e.target.value)}
								rows={3}
							/>
						</div>
						<div className="flex justify-end gap-2 pt-2">
							<Button
								variant="outline"
								onClick={() => setIsCancelDialogOpen(false)}
							>
								<T
									id="orders.details.dialog.cancel.keep"
									defaultMessage="Keep Order"
								/>
							</Button>
							<Button
								variant="destructive"
								onClick={handleCancelOrder}
								disabled={isCancellingOrder}
							>
								{isCancellingOrder && (
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								)}
								<T
									id="orders.details.dialog.cancel.submit"
									defaultMessage="Cancel Order"
								/>
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};
