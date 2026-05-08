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
	getOrdersByProductId,
	useCancelOrder,
	useUpdateOrderStatus,
} from "@/lib/api/orders";
import type { IOrderStatus, OrderListItem } from "@/@types/Order";
import { useQuery } from "@tanstack/react-query";
import {
	Loader2,
	MoreVertical,
	XCircle,
	FileText,
	ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ORDER_STATUSES: { value: IOrderStatus; label: string }[] = [
	{ value: "pending", label: "Pending" },
	{ value: "processing", label: "Processing" },
	{ value: "shipped", label: "Shipped" },
	{ value: "delivered", label: "Delivered" },
	{ value: "cancelled", label: "Cancelled" },
	{ value: "returned", label: "Returned" },
];

const getStatusBadgeVariant = (
	status: IOrderStatus
): "default" | "secondary" | "destructive" | "success" | "warning" | "info" => {
	switch (status) {
		case "pending":
			return "warning";
		case "processing":
			return "info";
		case "shipped":
			return "info";
		case "delivered":
			return "success";
		case "cancelled":
			return "destructive";
		case "returned":
			return "secondary";
		default:
			return "default";
	}
};

interface ProductOrdersProps {
	productId: string;
}

export const ProductOrders = ({ productId }: ProductOrdersProps) => {
	const t = useT();
	const { locale } = useLocale();
	const navigate = useNavigate();

	// Dialog states
	const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
	const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
	const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
	const [selectedOrderNumber, setSelectedOrderNumber] = useState<string>("");

	// Form states
	const [selectedStatus, setSelectedStatus] = useState<IOrderStatus | "">("");
	const [statusNote, setStatusNote] = useState("");
	const [cancelNote, setCancelNote] = useState("");

	const { data: ordersData, isPending: isLoadingOrders } = useQuery(
		getOrdersByProductId(productId)
	);

	const { mutate: updateOrderStatus, isPending: isUpdatingStatus } =
		useUpdateOrderStatus();
	const { mutate: cancelOrder, isPending: isCancellingOrder } =
		useCancelOrder();

	const getStatusLabel = (status: IOrderStatus) =>
		t(`orders.common.status.${status}`, status.charAt(0).toUpperCase() + status.slice(1));

	const formatCurrency = (value: string | number) =>
		`৳${Number(value).toLocaleString(locale === "bn" ? "bn-BD" : "en-BD", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})}`;

	const formatDateLocalized = (dateString: string) =>
		new Date(dateString).toLocaleDateString(locale === "bn" ? "bn-BD" : "en-BD", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});

	const handleOpenStatusDialog = (order: OrderListItem) => {
		setSelectedOrderId(order.id);
		setSelectedOrderNumber(order.order_number);
		setSelectedStatus(order.status);
		setStatusNote("");
		setIsStatusDialogOpen(true);
	};

	const handleOpenCancelDialog = (order: OrderListItem) => {
		setSelectedOrderId(order.id);
		setSelectedOrderNumber(order.order_number);
		setCancelNote("");
		setIsCancelDialogOpen(true);
	};

	const handleUpdateStatus = () => {
		if (!selectedStatus || !selectedOrderId) return;

		updateOrderStatus(
			{
				orderId: selectedOrderId,
				status: selectedStatus,
				note: statusNote || undefined,
			},
			{
				onSuccess: () => {
					toast.success(
						t(
							"products.orders.toast.statusUpdated",
							"Order status updated successfully",
						),
					);
					setIsStatusDialogOpen(false);
					setSelectedOrderId(null);
					setSelectedStatus("");
					setStatusNote("");
				},
				onError: (error) => {
					toast.error(
						t("products.orders.toast.statusFailed", "Failed to update order status"),
					);
					console.error(error);
				},
			}
		);
	};

	const handleCancelOrder = () => {
		if (!selectedOrderId) return;

		cancelOrder(
			{
				orderId: selectedOrderId,
				note: cancelNote || undefined,
			},
			{
				onSuccess: () => {
					toast.success(
						t("products.orders.toast.cancelled", "Order cancelled successfully"),
					);
					setIsCancelDialogOpen(false);
					setSelectedOrderId(null);
					setCancelNote("");
				},
				onError: (error) => {
					toast.error(
						t("products.orders.toast.cancelFailed", "Failed to cancel order"),
					);
					console.error(error);
				},
			}
		);
	};

	const orders = ordersData?.results || [];

	return (
		<>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FileText className="h-5 w-5" />
						<T id="products.orders.title" defaultMessage="Product Orders" />
					</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoadingOrders ? (
						<div className="flex justify-center items-center py-12">
							<Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
						</div>
					) : orders.length === 0 ? (
						<div className="text-center py-12">
							<FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<p className="text-muted-foreground">
								<T
									id="products.orders.empty"
									defaultMessage="No orders found for this product"
								/>
							</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>
										<T
											id="products.orders.table.orderNumber"
											defaultMessage="Order Number"
										/>
									</TableHead>
									<TableHead>
										<T id="products.orders.table.customer" defaultMessage="Customer" />
									</TableHead>
									<TableHead>
										<T id="products.orders.table.status" defaultMessage="Status" />
									</TableHead>
									<TableHead>
										<T id="products.orders.table.date" defaultMessage="Date" />
									</TableHead>
									<TableHead className="text-right">
										<T id="products.orders.table.amount" defaultMessage="Amount" />
									</TableHead>
									<TableHead className="text-right">
										<T id="products.orders.table.items" defaultMessage="Items" />
									</TableHead>
									<TableHead className="w-[70px]"></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{orders.map((order) => {
									const canCancel = ![
										"cancelled",
										"delivered",
										"returned",
									].includes(order.status);

									return (
										<TableRow key={order.id}>
											<TableCell className="font-medium">
												#{order.order_number}
											</TableCell>
											<TableCell>{order.customer_name}</TableCell>
											<TableCell>
												<Badge variant={getStatusBadgeVariant(order.status)}>
													{getStatusLabel(order.status)}
												</Badge>
											</TableCell>
											<TableCell className="text-muted-foreground">
												{formatDateLocalized(order.created_at)}
											</TableCell>
											<TableCell className="text-right">
												{formatCurrency(order.total_amount)}
											</TableCell>
											<TableCell className="text-right">
												{order.items_count.toLocaleString(
													locale === "bn" ? "bn-BD" : "en-IN",
												)}
											</TableCell>
											<TableCell>
												<div className="flex justify-end gap-1">
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8"
														onClick={() =>
															navigate(`/orders/${order.id}`)
														}
														title={t(
															"products.orders.actions.view",
															"View Order Details",
														)}
													>
														<ArrowRight className="h-4 w-4" />
													</Button>
													<DropdownMenu>
														<DropdownMenuTrigger asChild>
															<Button
																variant="ghost"
																size="icon"
																className="h-8 w-8"
															>
																<MoreVertical className="h-4 w-4" />
															</Button>
														</DropdownMenuTrigger>
														<DropdownMenuContent align="end">
															<DropdownMenuItem
																onClick={() => handleOpenStatusDialog(order)}
															>
																<T
																	id="products.orders.actions.changeStatus"
																	defaultMessage="Change Status"
																/>
															</DropdownMenuItem>
															{canCancel && (
																<>
																	<DropdownMenuSeparator />
																	<DropdownMenuItem
																		className="text-destructive focus:text-destructive"
																		onClick={() => handleOpenCancelDialog(order)}
																	>
																		<XCircle className="h-4 w-4 mr-2" />
																		<T
																			id="products.orders.actions.cancel"
																			defaultMessage="Cancel Order"
																		/>
																	</DropdownMenuItem>
																</>
															)}
														</DropdownMenuContent>
													</DropdownMenu>
												</div>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{/* Change Order Status Dialog */}
			<Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							<T
								id="products.orders.dialog.status.title"
								defaultMessage="Change Order Status"
							/>
						</DialogTitle>
						<DialogDescription>
							{t(
								"products.orders.dialog.status.description",
								"Update the status of order #{orderNumber}",
								{ orderNumber: selectedOrderNumber },
							)}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 pt-4">
						<div className="space-y-2">
							<Label htmlFor="status">
								<T
									id="products.orders.dialog.status.newStatus"
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
											"products.orders.dialog.status.placeholder",
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
									id="products.orders.dialog.status.note"
									defaultMessage="Note (Optional)"
								/>
							</Label>
							<Textarea
								id="note"
								placeholder={t(
									"products.orders.dialog.status.notePlaceholder",
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
									id="products.orders.dialog.status.submit"
									defaultMessage="Update Status"
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
								id="products.orders.dialog.cancel.title"
								defaultMessage="Cancel Order"
							/>
						</DialogTitle>
						<DialogDescription>
							{t(
								"products.orders.dialog.cancel.description",
								"Are you sure you want to cancel order #{orderNumber}? This action cannot be undone.",
								{ orderNumber: selectedOrderNumber },
							)}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 pt-4">
						<div className="space-y-2">
							<Label htmlFor="cancel-note">
								<T
									id="products.orders.dialog.cancel.reason"
									defaultMessage="Cancellation Reason (Optional)"
								/>
							</Label>
							<Textarea
								id="cancel-note"
								placeholder={t(
									"products.orders.dialog.cancel.reasonPlaceholder",
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
									id="products.orders.dialog.cancel.keep"
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
									id="products.orders.dialog.cancel.submit"
									defaultMessage="Cancel Order"
								/>
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
};
