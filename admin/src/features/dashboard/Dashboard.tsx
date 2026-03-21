import { useQuery } from "@tanstack/react-query";
import { getDashboardMetrics } from "@/lib/api/dashboard";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
	ArrowDown,
	ArrowUp,
	DollarSign,
	Package,
	ShoppingCart,
	Users,
	AlertTriangle,
} from "lucide-react";
import { Link } from "react-router";

const STATUS_BADGE_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning" | "info" | "purple" | "cyan" }> = {
	pending: { label: "Pending", variant: "warning" },
	confirmed: { label: "Confirmed", variant: "info" },
	processing: { label: "Processing", variant: "purple" },
	shipped: { label: "Shipped", variant: "cyan" },
	delivered: { label: "Delivered", variant: "success" },
	cancelled: { label: "Cancelled", variant: "destructive" },
	refunded: { label: "Refunded", variant: "secondary" },
};

const PAYMENT_BADGE_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning" }> = {
	pending: { label: "Pending", variant: "warning" },
	paid: { label: "Paid", variant: "success" },
	failed: { label: "Failed", variant: "destructive" },
	refunded: { label: "Refunded", variant: "secondary" },
};

function formatCurrency(value: string | number) {
	const num = typeof value === "string" ? parseFloat(value) : value;
	return `৳${num.toLocaleString("en-BD", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatDate(dateStr: string) {
	return new Date(dateStr).toLocaleDateString("en-BD", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function ChangeIndicator({ value }: { value: number }) {
	if (value === 0) return <span className="text-xs text-muted-foreground">No change</span>;
	const isPositive = value > 0;
	return (
		<span className={`flex items-center gap-0.5 text-xs ${isPositive ? "text-green-600" : "text-red-600"}`}>
			{isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
			{Math.abs(value)}% from last month
		</span>
	);
}

function MetricCardSkeleton() {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<Skeleton className="h-4 w-24" />
				<Skeleton className="h-4 w-4" />
			</CardHeader>
			<CardContent>
				<Skeleton className="h-7 w-20 mb-1" />
				<Skeleton className="h-3 w-32" />
			</CardContent>
		</Card>
	);
}

export function Dashboard() {
	const { data: metrics, isLoading, isError } = useQuery(getDashboardMetrics());

	if (isError) {
		return (
			<div className="flex items-center justify-center h-64">
				<p className="text-muted-foreground">Failed to load dashboard metrics.</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
				{isLoading ? (
					<>
						<MetricCardSkeleton />
						<MetricCardSkeleton />
						<MetricCardSkeleton />
						<MetricCardSkeleton />
					</>
				) : metrics ? (
					<>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
								<DollarSign className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{formatCurrency(metrics.revenue.total)}</div>
								<ChangeIndicator value={metrics.revenue.change_percent} />
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Orders</CardTitle>
								<ShoppingCart className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{metrics.orders.total}</div>
								<ChangeIndicator value={metrics.orders.change_percent} />
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Customers</CardTitle>
								<Users className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{metrics.customers.total}</div>
								<ChangeIndicator value={metrics.customers.change_percent} />
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Products</CardTitle>
								<Package className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{metrics.products.total}</div>
								<p className="text-xs text-muted-foreground">
									{metrics.products.out_of_stock} out of stock
								</p>
							</CardContent>
						</Card>
					</>
				) : null}
			</div>

			{/* Order Status Overview */}
			{metrics && Object.keys(metrics.orders.by_status).length > 0 && (
				<div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
					{Object.entries(metrics.orders.by_status).map(([status, count]) => {
						const badge = STATUS_BADGE_MAP[status];
						return (
							<Card key={status} className="py-3">
								<CardContent className="px-4 py-0 flex flex-col items-center gap-1">
									<span className="text-lg font-semibold">{count}</span>
									<Badge variant={badge?.variant ?? "secondary"} className="text-[10px]">
										{badge?.label ?? status}
									</Badge>
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}

			{/* Recent Orders + Low Stock Alerts */}
			<div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
				{/* Recent Orders */}
				<Card className="xl:col-span-2">
					<CardHeader className="flex flex-row items-center justify-between">
						<div className="grid gap-1">
							<CardTitle>Recent Orders</CardTitle>
							<CardDescription>Latest orders from your store</CardDescription>
						</div>
						<Link
							to="/orders"
							className="text-sm text-primary underline-offset-4 hover:underline"
						>
							View all
						</Link>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<div className="space-y-4">
								{Array.from({ length: 5 }).map((_, i) => (
									<div key={i} className="flex items-center justify-between">
										<div className="space-y-1">
											<Skeleton className="h-4 w-32" />
											<Skeleton className="h-3 w-24" />
										</div>
										<Skeleton className="h-5 w-16" />
									</div>
								))}
							</div>
						) : metrics?.recent_orders.length ? (
							<div className="space-y-4">
								{metrics.recent_orders.map((order) => {
									const statusBadge = STATUS_BADGE_MAP[order.status];
									const paymentBadge = PAYMENT_BADGE_MAP[order.payment_status];
									return (
										<Link
											key={order.id}
											to={`/orders/${order.id}`}
											className="flex items-center justify-between hover:bg-muted/50 -mx-2 px-2 py-1.5 rounded-md transition-colors"
										>
											<div className="grid gap-0.5">
												<div className="flex items-center gap-2">
													<span className="text-sm font-medium">
														{order.order_number}
													</span>
													<Badge variant={statusBadge?.variant ?? "secondary"} className="text-[10px]">
														{statusBadge?.label ?? order.status}
													</Badge>
													<Badge variant={paymentBadge?.variant ?? "secondary"} className="text-[10px]">
														{paymentBadge?.label ?? order.payment_status}
													</Badge>
												</div>
												<span className="text-xs text-muted-foreground">
													{order.customer_name} &middot; {formatDate(order.created_at)}
												</span>
											</div>
											<span className="font-medium text-sm">
												{formatCurrency(order.total_amount)}
											</span>
										</Link>
									);
								})}
							</div>
						) : (
							<p className="text-sm text-muted-foreground">No orders yet.</p>
						)}
					</CardContent>
				</Card>

				{/* Low Stock Alerts */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<div className="grid gap-1">
							<CardTitle className="flex items-center gap-2">
								<AlertTriangle className="h-4 w-4 text-yellow-500" />
								Low Stock Alerts
							</CardTitle>
							<CardDescription>Products running low on inventory</CardDescription>
						</div>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<div className="space-y-4">
								{Array.from({ length: 3 }).map((_, i) => (
									<div key={i} className="flex items-center justify-between">
										<Skeleton className="h-4 w-32" />
										<Skeleton className="h-4 w-12" />
									</div>
								))}
							</div>
						) : metrics?.products.low_stock.length ? (
							<div className="space-y-3">
								{metrics.products.low_stock.map((product) => (
									<Link
										key={product.id}
										to={`/products/${product.id}`}
										className="flex items-center justify-between hover:bg-muted/50 -mx-2 px-2 py-1.5 rounded-md transition-colors"
									>
										<span className="text-sm font-medium truncate mr-2">
											{product.name}
										</span>
										<Badge variant={product.stock_quantity <= 3 ? "destructive" : "warning"}>
											{product.stock_quantity} left
										</Badge>
									</Link>
								))}
							</div>
						) : (
							<p className="text-sm text-muted-foreground">All products are well-stocked.</p>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Avg Order Value */}
			{metrics && (
				<div className="grid gap-4 md:grid-cols-3">
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{formatCurrency(metrics.orders.avg_order_value)}</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">This Month Revenue</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{formatCurrency(metrics.revenue.current_month)}</div>
							<p className="text-xs text-muted-foreground">
								{metrics.orders.current_month} orders this month
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">New Customers This Month</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{metrics.customers.new_this_month}</div>
							<ChangeIndicator value={metrics.customers.change_percent} />
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}
