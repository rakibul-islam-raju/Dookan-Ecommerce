import { AppTable, type Column } from "@/components/common/AppTable";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { pagination } from "@/config";
import { useLocale } from "@/i18n/locale-context";
import { T } from "@/i18n/translate";
import { useT } from "@/i18n/use-t";
import { getCustomerById } from "@/lib/api/customer";
import { getOrders, type OrderFilter } from "@/lib/api/orders";
import { getReviews, type ReviewFilter } from "@/lib/api/review";
import type { IOrderPaymentStatus, IOrderStatus } from "@/@types/Order";
import type { OrderListItem } from "@/@types/Order";
import type { ReviewListItem } from "@/@types/Review";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

export function CustomerDetails() {
	const t = useT();
	const { locale } = useLocale();
	const { id } = useParams<{ id: string }>();
	const customerId = id ?? "";

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		}).format(date);
	};

	const formatAmount = (amount: string) =>
		`৳${parseFloat(amount).toLocaleString(locale === "bn" ? "bn-BD" : "en-IN", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		})}`;

	const {
		data: customer,
		isFetching: isCustomerFetching,
		isError: isCustomerError,
	} = useQuery({
		...getCustomerById(customerId),
		enabled: Boolean(customerId),
	});

	const ordersParams: OrderFilter = {
		limit: pagination.limit,
		offset: 0,
		user: customerId,
	};
	const { data: ordersData, isFetching: isOrdersFetching } = useQuery({
		...getOrders(ordersParams),
		enabled: Boolean(customerId),
	});

	const reviewsParams: ReviewFilter = {
		limit: pagination.limit,
		offset: 0,
		user: customerId,
	};
	const { data: reviewsData, isFetching: isReviewsFetching } = useQuery({
		...getReviews(reviewsParams),
		enabled: Boolean(customerId),
	});

	const orderStatusLabels: Record<IOrderStatus, string> = {
		pending: t("customers.details.orderStatus.pending", "Pending"),
		confirmed: t("customers.details.orderStatus.confirmed", "Confirmed"),
		processing: t("customers.details.orderStatus.processing", "Processing"),
		shipped: t("customers.details.orderStatus.shipped", "Shipped"),
		delivered: t("customers.details.orderStatus.delivered", "Delivered"),
		cancelled: t("customers.details.orderStatus.cancelled", "Cancelled"),
		refunded: t("customers.details.orderStatus.refunded", "Refunded"),
	};

	const paymentStatusLabels: Record<IOrderPaymentStatus, string> = {
		pending: t("customers.details.paymentStatus.pending", "Pending"),
		paid: t("customers.details.paymentStatus.paid", "Paid"),
		failed: t("customers.details.paymentStatus.failed", "Failed"),
		refunded: t("customers.details.paymentStatus.refunded", "Refunded"),
	};

	if (!customerId) {
		return (
			<div className="space-y-2">
				<h1 className="text-2xl font-bold tracking-tight">
					<T id="customers.details.title" defaultMessage="Customer" />
				</h1>
				<p className="text-muted-foreground">
					<T
						id="customers.details.missingId"
						defaultMessage="Missing customer id."
					/>
				</p>
			</div>
		);
	}

	const orderColumns: Column<OrderListItem>[] = [
		{
			key: "order_number",
			header: t("customers.details.orders.table.order", "Order"),
			render: (order) => (
				<Link to={`/orders/${order.id}`} className="font-medium hover:underline">
					{order.order_number}
				</Link>
			),
		},
		{
			key: "status",
			header: t("customers.details.orders.table.status", "Status"),
			render: (order) => (
				<Badge variant="secondary">
					{orderStatusLabels[order.status]}
				</Badge>
			),
		},
		{
			key: "payment_status",
			header: t("customers.details.orders.table.payment", "Payment"),
			render: (order) => (
				<Badge variant="secondary">
					{paymentStatusLabels[order.payment_status]}
				</Badge>
			),
		},
		{
			key: "total_amount",
			header: t("customers.details.orders.table.total", "Total"),
			render: (order) => (
				<span className="font-medium">{formatAmount(order.total_amount)}</span>
			),
			className: "text-right",
		},
		{
			key: "created_at",
			header: t("customers.details.table.date", "Date"),
			render: (order) => (
				<span className="text-muted-foreground">{formatDate(order.created_at)}</span>
			),
		},
	];

	const reviewColumns: Column<ReviewListItem>[] = [
		{
			key: "product_name",
			header: t("customers.details.reviews.table.product", "Product"),
			render: (review) => (
				<div className="font-medium max-w-[220px] truncate">
					{review.product_name}
				</div>
			),
		},
		{
			key: "rating",
			header: t("customers.details.reviews.table.rating", "Rating"),
			render: (review) => (
				<span className="text-muted-foreground">
					{review.rating.toLocaleString(locale === "bn" ? "bn-BD" : "en-IN")}/5
				</span>
			),
			className: "text-center",
		},
		{
			key: "is_approved",
			header: t("customers.details.reviews.table.status", "Status"),
			render: (review) => (
				<Badge variant={review.is_approved ? "success" : "warning"}>
					{review.is_approved
						? t("customers.details.reviews.status.approved", "Approved")
						: t("customers.details.reviews.status.pending", "Pending")}
				</Badge>
			),
		},
		{
			key: "comment",
			header: t("customers.details.reviews.table.review", "Review"),
			render: (review) => (
				<div className="max-w-[420px]">
					{review.title ? (
						<div className="font-medium text-sm truncate">{review.title}</div>
					) : null}
					<div className="text-muted-foreground text-sm truncate">
						{review.comment || t("customers.details.emptyValue", "-")}
					</div>
				</div>
			),
		},
		{
			key: "created_at",
			header: t("customers.details.table.date", "Date"),
			render: (review) => (
				<span className="text-muted-foreground">{formatDate(review.created_at)}</span>
			),
		},
	];

	const orders = ordersData?.results ?? [];
	const reviews = reviewsData?.results ?? [];

	return (
		<div className="space-y-6">
			<div className="flex items-start justify-between gap-4">
				<div className="space-y-1">
					<h1 className="text-3xl font-bold tracking-tight">
						<T id="customers.details.title" defaultMessage="Customer" />
					</h1>
					{customer ? (
						<p className="text-muted-foreground">
							{customer.first_name} {customer.last_name} · {customer.email}
						</p>
					) : (
						<p className="text-muted-foreground">
							{isCustomerError
								? t("customers.details.loadFailed", "Failed to load customer.")
								: t("customers.details.loading", "Loading...")}
						</p>
					)}
				</div>

				{customer ? (
					<Badge variant={customer.is_active ? "default" : "destructive"}>
						{customer.is_active
							? t("customers.list.status.active", "Active")
							: t("customers.list.status.inactive", "Inactive")}
					</Badge>
				) : null}
			</div>

			<Tabs defaultValue="info">
				<TabsList>
					<TabsTrigger value="info">
						<T id="customers.details.tabs.info" defaultMessage="User Info" />
					</TabsTrigger>
					<TabsTrigger value="orders">
						<T id="customers.details.tabs.orders" defaultMessage="Orders" />
					</TabsTrigger>
					<TabsTrigger value="reviews">
						<T id="customers.details.tabs.reviews" defaultMessage="Review" />
					</TabsTrigger>
				</TabsList>

				<TabsContent value="info" className="space-y-4">
					{isCustomerFetching && !customer ? (
						<div className="text-muted-foreground">
							<T
								id="customers.details.loadingInfo"
								defaultMessage="Loading user info..."
							/>
						</div>
					) : null}

					{customer ? (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="rounded-lg border p-4 space-y-2">
								<div className="text-sm text-muted-foreground">
									<T id="customers.details.info.name" defaultMessage="Name" />
								</div>
								<div className="font-medium">
									{customer.first_name} {customer.last_name}
								</div>
							</div>
							<div className="rounded-lg border p-4 space-y-2">
								<div className="text-sm text-muted-foreground">
									<T id="customers.details.info.email" defaultMessage="Email" />
								</div>
								<div className="font-medium">{customer.email}</div>
							</div>
							<div className="rounded-lg border p-4 space-y-2">
								<div className="text-sm text-muted-foreground">
									<T id="customers.details.info.mobile" defaultMessage="Mobile" />
								</div>
								<div className="font-medium">{customer.mobile_number}</div>
							</div>
							<div className="rounded-lg border p-4 space-y-2">
								<div className="text-sm text-muted-foreground">
									<T id="customers.details.info.joined" defaultMessage="Joined" />
								</div>
								<div className="font-medium">{formatDate(customer.created_at)}</div>
							</div>

							<div className="rounded-lg border p-4 space-y-2 md:col-span-2">
								<div className="text-sm text-muted-foreground">
									<T
										id="customers.details.info.defaultAddress"
										defaultMessage="Default Address"
									/>
								</div>
								{customer.default_address ? (
									<div className="text-sm">
										<div className="font-medium">
											{customer.default_address.full_name}
										</div>
										<div className="text-muted-foreground">
											{customer.default_address.address_line1}
											{customer.default_address.address_line2
												? `, ${customer.default_address.address_line2}`
												: ""}
											, {customer.default_address.city}, {customer.default_address.state}{" "}
											{customer.default_address.postal_code}, {customer.default_address.country}
										</div>
										<div className="text-muted-foreground">
											{customer.default_address.mobile_number}
										</div>
									</div>
								) : (
									<div className="text-muted-foreground text-sm">
										<T
											id="customers.details.info.noDefaultAddress"
											defaultMessage="No default address."
										/>
									</div>
								)}
							</div>
						</div>
					) : (
						<div className="text-muted-foreground">
							<T
								id="customers.details.noData"
								defaultMessage="No customer data."
							/>
						</div>
					)}
				</TabsContent>

				<TabsContent value="orders">
					<AppTable
						data={orders}
						columns={orderColumns}
						isLoading={isOrdersFetching}
						emptyMessage={t(
							"customers.details.orders.empty",
							"No orders found for this customer",
						)}
						pagination={undefined}
					/>
				</TabsContent>

				<TabsContent value="reviews">
					<AppTable
						data={reviews}
						columns={reviewColumns}
						isLoading={isReviewsFetching}
						emptyMessage={t(
							"customers.details.reviews.empty",
							"No reviews found for this customer",
						)}
						pagination={undefined}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}
