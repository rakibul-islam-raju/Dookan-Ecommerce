import { AppTable, type Column } from "@/components/common/AppTable";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { pagination } from "@/config";
import { getCustomerById } from "@/lib/api/customer";
import { getOrders, type OrderFilter } from "@/lib/api/orders";
import { getReviews, type ReviewFilter } from "@/lib/api/review";
import type { OrderListItem } from "@/@types/Order";
import type { ReviewListItem } from "@/@types/Review";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	}).format(date);
};

export function CustomerDetails() {
	const { id } = useParams<{ id: string }>();

	if (!id) {
		return (
			<div className="space-y-2">
				<h1 className="text-2xl font-bold tracking-tight">Customer</h1>
				<p className="text-muted-foreground">Missing customer id.</p>
			</div>
		);
	}

	const {
		data: customer,
		isFetching: isCustomerFetching,
		isError: isCustomerError,
	} = useQuery(getCustomerById(id));

	const ordersParams: OrderFilter = {
		limit: pagination.limit,
		offset: 0,
		user: id,
	};
	const { data: ordersData, isFetching: isOrdersFetching } = useQuery(
		getOrders(ordersParams)
	);

	const reviewsParams: ReviewFilter = {
		limit: pagination.limit,
		offset: 0,
		user: id,
	};
	const { data: reviewsData, isFetching: isReviewsFetching } = useQuery(
		getReviews(reviewsParams)
	);

	const orderColumns: Column<OrderListItem>[] = [
		{
			key: "order_number",
			header: "Order",
			render: (order) => (
				<Link to={`/orders/${order.id}`} className="font-medium hover:underline">
					{order.order_number}
				</Link>
			),
		},
		{
			key: "status",
			header: "Status",
			render: (order) => (
				<Badge variant="secondary">
					{order.status.charAt(0).toUpperCase() + order.status.slice(1)}
				</Badge>
			),
		},
		{
			key: "payment_status",
			header: "Payment",
			render: (order) => (
				<Badge variant="secondary">
					{order.payment_status.charAt(0).toUpperCase() +
						order.payment_status.slice(1)}
				</Badge>
			),
		},
		{
			key: "total_amount",
			header: "Total",
			render: (order) => (
				<span className="font-medium">
					৳ {parseFloat(order.total_amount).toFixed(2)}
				</span>
			),
			className: "text-right",
		},
		{
			key: "created_at",
			header: "Date",
			render: (order) => (
				<span className="text-muted-foreground">{formatDate(order.created_at)}</span>
			),
		},
	];

	const reviewColumns: Column<ReviewListItem>[] = [
		{
			key: "product_name",
			header: "Product",
			render: (review) => (
				<div className="font-medium max-w-[220px] truncate">
					{review.product_name}
				</div>
			),
		},
		{
			key: "rating",
			header: "Rating",
			render: (review) => <span className="text-muted-foreground">{review.rating}/5</span>,
			className: "text-center",
		},
		{
			key: "is_approved",
			header: "Status",
			render: (review) => (
				<Badge variant={review.is_approved ? "success" : "warning"}>
					{review.is_approved ? "Approved" : "Pending"}
				</Badge>
			),
		},
		{
			key: "comment",
			header: "Review",
			render: (review) => (
				<div className="max-w-[420px]">
					{review.title ? (
						<div className="font-medium text-sm truncate">{review.title}</div>
					) : null}
					<div className="text-muted-foreground text-sm truncate">
						{review.comment || "-"}
					</div>
				</div>
			),
		},
		{
			key: "created_at",
			header: "Date",
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
					<h1 className="text-3xl font-bold tracking-tight">Customer</h1>
					{customer ? (
						<p className="text-muted-foreground">
							{customer.first_name} {customer.last_name} · {customer.email}
						</p>
					) : (
						<p className="text-muted-foreground">
							{isCustomerError ? "Failed to load customer." : "Loading..."}
						</p>
					)}
				</div>

				{customer ? (
					<Badge variant={customer.is_active ? "default" : "destructive"}>
						{customer.is_active ? "Active" : "Inactive"}
					</Badge>
				) : null}
			</div>

			<Tabs defaultValue="info">
				<TabsList>
					<TabsTrigger value="info">User Info</TabsTrigger>
					<TabsTrigger value="orders">Orders</TabsTrigger>
					<TabsTrigger value="reviews">Review</TabsTrigger>
				</TabsList>

				<TabsContent value="info" className="space-y-4">
					{isCustomerFetching && !customer ? (
						<div className="text-muted-foreground">Loading user info...</div>
					) : null}

					{customer ? (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="rounded-lg border p-4 space-y-2">
								<div className="text-sm text-muted-foreground">Name</div>
								<div className="font-medium">
									{customer.first_name} {customer.last_name}
								</div>
							</div>
							<div className="rounded-lg border p-4 space-y-2">
								<div className="text-sm text-muted-foreground">Email</div>
								<div className="font-medium">{customer.email}</div>
							</div>
							<div className="rounded-lg border p-4 space-y-2">
								<div className="text-sm text-muted-foreground">Mobile</div>
								<div className="font-medium">{customer.mobile_number}</div>
							</div>
							<div className="rounded-lg border p-4 space-y-2">
								<div className="text-sm text-muted-foreground">Joined</div>
								<div className="font-medium">{formatDate(customer.created_at)}</div>
							</div>

							<div className="rounded-lg border p-4 space-y-2 md:col-span-2">
								<div className="text-sm text-muted-foreground">Default Address</div>
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
									<div className="text-muted-foreground text-sm">No default address.</div>
								)}
							</div>
						</div>
					) : (
						<div className="text-muted-foreground">No customer data.</div>
					)}
				</TabsContent>

				<TabsContent value="orders">
					<AppTable
						data={orders}
						columns={orderColumns}
						isLoading={isOrdersFetching}
						emptyMessage="No orders found for this customer"
						pagination={undefined}
					/>
				</TabsContent>

				<TabsContent value="reviews">
					<AppTable
						data={reviews}
						columns={reviewColumns}
						isLoading={isReviewsFetching}
						emptyMessage="No reviews found for this customer"
						pagination={undefined}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}

