"use client";

import { IOrderStatus } from "@/@types/Order";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useMyOrders } from "@/lib/hooks/useOrders";
import { cn } from "@/lib/utils";
import {
	CheckCircle2,
	ChevronRight,
	Clock,
	Package,
	Truck,
	XCircle,
} from "lucide-react";
import Link from "next/link";

const getStatusColor = (status: IOrderStatus) => {
	switch (status) {
		case "pending":
			return "bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25 border-yellow-200";
		case "processing":
			return "bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 border-blue-200";
		case "shipped":
			return "bg-purple-500/15 text-purple-700 hover:bg-purple-500/25 border-purple-200";
		case "delivered":
			return "bg-green-500/15 text-green-700 hover:bg-green-500/25 border-green-200";
		case "cancelled":
			return "bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-200";
		case "returned":
			return "bg-gray-500/15 text-gray-700 hover:bg-gray-500/25 border-gray-200";
		default:
			return "bg-gray-100 text-gray-800";
	}
};

const getStatusIcon = (status: IOrderStatus) => {
	switch (status) {
		case "pending":
			return <Clock className="size-3.5 mr-1" />;
		case "processing":
			return <Package className="size-3.5 mr-1" />;
		case "shipped":
			return <Truck className="size-3.5 mr-1" />;
		case "delivered":
			return <CheckCircle2 className="size-3.5 mr-1" />;
		case "cancelled":
			return <XCircle className="size-3.5 mr-1" />;
		default:
			return null;
	}
};

export default function OrdersPage() {
	const { data: orders, isLoading, error } = useMyOrders();

	if (isLoading) {
		return (
			<div className="space-y-8">
				<div className="flex flex-col gap-2">
					<h1 className="text-3xl font-bold font-serif">My Orders</h1>
					<p className="text-muted-foreground">
						View and track your order history.
					</p>
				</div>
				<div className="flex items-center justify-center py-12">
					<div className="text-center">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
						<p className="text-muted-foreground">Loading orders...</p>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-8">
				<div className="flex flex-col gap-2">
					<h1 className="text-3xl font-bold font-serif">My Orders</h1>
					<p className="text-muted-foreground">
						View and track your order history.
					</p>
				</div>
				<div className="flex items-center justify-center py-12">
					<div className="text-center">
						<div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
							<XCircle className="size-8 text-red-500" />
						</div>
						<h3 className="text-lg font-semibold mb-2">
							Failed to load orders
						</h3>
						<p className="text-muted-foreground">
							{error?.message ||
								"Something went wrong while loading your orders."}
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl font-bold font-serif">My Orders</h1>
				<p className="text-muted-foreground">
					View and track your order history.
				</p>
			</div>

			{/* Orders List */}
			{orders?.results && orders.results.length > 0 ? (
				<>
					{/* Desktop Table View */}
					<div className="hidden md:block rounded-xl border bg-card shadow-sm overflow-hidden">
						<Table>
							<TableHeader>
								<TableRow className="bg-muted/50 hover:bg-muted/50">
									<TableHead>Order Number</TableHead>
									<TableHead>Date</TableHead>
									<TableHead>Status</TableHead>
									<TableHead className="text-right">Total</TableHead>
									<TableHead className="w-[100px]"></TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{orders.results.map((order) => (
									<TableRow
										key={order.id}
										className="group cursor-pointer hover:bg-muted/30 transition-colors"
									>
										<TableCell className="font-medium">
											{order.order_number}
										</TableCell>
										<TableCell>
											{new Date(order.created_at).toLocaleDateString("en-US", {
												year: "numeric",
												month: "long",
												day: "numeric",
											})}
										</TableCell>
										<TableCell>
											<Badge
												variant="outline"
												className={cn(
													"font-normal capitalize",
													getStatusColor(order.status)
												)}
											>
												{getStatusIcon(order.status)}
												{order.status}
											</Badge>
										</TableCell>
										<TableCell className="text-right font-medium">
											৳{order.total_amount}
										</TableCell>
										<TableCell>
											<Button
												variant="ghost"
												size="icon"
												asChild
												className="opacity-0 group-hover:opacity-100 transition-opacity"
											>
												<Link href={`/orders/${order.id}`}>
													<ChevronRight className="size-4" />
												</Link>
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>

					{/* Mobile Card View */}
					<div className="grid gap-4 md:hidden">
						{orders.results.map((order) => (
							<Link
								key={order.id}
								href={`/orders/${order.id}`}
								className="block p-4 rounded-xl border bg-card shadow-sm active:scale-[0.98] transition-transform"
							>
								<div className="flex justify-between items-start mb-4">
									<div>
										<div className="font-semibold text-foreground">
											{order.order_number}
										</div>
										<div className="text-sm text-muted-foreground">
											{new Date(order.created_at).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
												year: "numeric",
											})}
										</div>
									</div>
									<Badge
										variant="outline"
										className={cn(
											"font-normal capitalize",
											getStatusColor(order.status)
										)}
									>
										{order.status}
									</Badge>
								</div>
								<div className="flex justify-between items-center pt-4 border-t border-border/50">
									<span className="font-medium text-lg">
										${order.total_amount}
									</span>
									<div className="flex items-center text-sm text-primary font-medium">
										View Details <ChevronRight className="size-4 ml-1" />
									</div>
								</div>
							</Link>
						))}
					</div>
				</>
			) : (
				<div className="text-center py-20">
					<div className="bg-muted/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
						<Package className="size-8 text-muted-foreground" />
					</div>
					<h3 className="text-lg font-semibold mb-2">No orders yet</h3>
					<p className="text-muted-foreground mb-6">
						You haven&apos;t placed any orders yet. Start shopping to see them
						here.
					</p>
					<Button asChild>
						<Link href="/">Start Shopping</Link>
					</Button>
				</div>
			)}
		</div>
	);
}
