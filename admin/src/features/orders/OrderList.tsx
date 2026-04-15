import { AppTable, type Column } from "@/components/common/AppTable";
import { FilterDrawer } from "@/components/common/FilterDrawer";
import { SearchBar } from "@/components/common/SearchBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { pagination } from "@/config";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useFilterParams } from "@/hooks/useFilterParams";
import { getOrders, type OrderFilter } from "@/lib/api/orders";
import type {
	IOrderStatus,
	IOrderPaymentStatus,
	OrderListItem,
} from "@/@types/Order";
import { useQuery } from "@tanstack/react-query";
import { Eye, MoreHorizontal, Plus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { OrderFilterForm } from "./components/OrderFilterForm";

const initialParams: OrderFilter = {
	limit: pagination.limit,
	offset: 0,
};

export function OrderList() {
	const navigate = useNavigate();
	const { params, handleChangeParams, resetParams } = useFilterParams({
		initialParams,
	});
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [isFilterOpen, setIsFilterOpen] = useState(false);

	const debouncedSearchQuery = useDebouncedValue(searchQuery);

	// Fetch orders using TanStack Query
	const { data, isFetching } = useQuery(
		getOrders({
			...params,
			search: debouncedSearchQuery || undefined,
			offset: (currentPage - 1) * pagination.limit,
		}),
	);

	const getStatusBadgeVariant = (
		status: IOrderStatus,
	):
		| "default"
		| "secondary"
		| "destructive"
		| "success"
		| "warning"
		| "info"
		| "purple"
		| "cyan" => {
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
			case "returned":
				return "secondary";
			default:
				return "default";
		}
	};

	const getPaymentStatusBadgeVariant = (
		status: IOrderPaymentStatus,
	):
		| "default"
		| "secondary"
		| "destructive"
		| "success"
		| "warning"
		| "info" => {
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

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		}).format(date);
	};

	const formatTime = (dateString: string) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("en-US", {
			hour: "2-digit",
			minute: "2-digit",
		}).format(date);
	};

	const columns: Column<OrderListItem>[] = [
		{
			key: "order_number",
			header: "Order",
			render: (order) => (
				<Link
					to={`/orders/${order.id}`}
					className="font-medium hover:underline"
				>
					{order.order_number}
				</Link>
			),
		},
		{
			key: "customer_name",
			header: "Customer",
			render: (order) => (
				<span className="text-muted-foreground">{order.customer_name}</span>
			),
		},
		{
			key: "is_guest_order",
			header: "Guest",
			render: (order) =>
				order.is_guest_order ? (
					<Badge variant="secondary">Guest</Badge>
				) : (
					<span className="text-muted-foreground">—</span>
				),
			className: "text-center",
		},
		{
			key: "items_count",
			header: "Items",
			render: (order) => <span>{order.items_count}</span>,
			className: "text-center",
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
			key: "status",
			header: "Status",
			render: (order) => (
				<Badge variant={getStatusBadgeVariant(order.status)}>
					{order.status.charAt(0).toUpperCase() + order.status.slice(1)}
				</Badge>
			),
		},
		{
			key: "payment_status",
			header: "Payment",
			render: (order) => (
				<Badge variant={getPaymentStatusBadgeVariant(order.payment_status)}>
					{order.payment_status.charAt(0).toUpperCase() +
						order.payment_status.slice(1)}
				</Badge>
			),
		},
		{
			key: "created_at",
			header: "Date",
			render: (order) => (
				<div className="text-muted-foreground">
					<div className="text-sm">{formatDate(order.created_at)}</div>
					<div className="text-xs">{formatTime(order.created_at)}</div>
				</div>
			),
		},
		{
			key: "actions",
			header: "",
			render: (order) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => navigate(`/orders/${order.id}`)}>
							<Eye className="h-4 w-4 mr-2" />
							View Details
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
			className: "w-[50px]",
		},
	];

	const handleApplyFilters = (filter: OrderFilter) => {
		handleChangeParams({
			...filter,
			offset: 0,
		});
		setCurrentPage(1);
		setIsFilterOpen(false);
	};

	const handleResetFilters = () => {
		resetParams();
		setSearchQuery("");
		setCurrentPage(1);
		setIsFilterOpen(false);
	};

	// Calculate pagination
	const totalPages = data ? Math.ceil(data.count / pagination.limit) : 0;
	const orders = data?.results || [];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Orders</h1>
					<p className="text-muted-foreground">
						Manage customer orders and track deliveries
					</p>
				</div>
				<Button onClick={() => navigate("/orders/create")}>
					<Plus className="h-4 w-4 mr-2" />
					Create Order
				</Button>
			</div>

			{/* Search and Filter Bar */}
			<div className="flex items-center gap-4">
				<SearchBar
					value={searchQuery}
					onChange={setSearchQuery}
					placeholder="Search orders by number or customer name..."
					className="flex-1"
				/>
				<FilterDrawer open={isFilterOpen} onOpenChange={setIsFilterOpen}>
					<OrderFilterForm
						initialFilter={params}
						onFilter={handleApplyFilters}
						onReset={handleResetFilters}
					/>
				</FilterDrawer>
			</div>

			{/* Orders Table */}
			<AppTable
				data={orders}
				columns={columns}
				isLoading={isFetching}
				emptyMessage="No orders found"
				pagination={{
					currentPage,
					totalPages,
					onPageChange: setCurrentPage,
					pageSize: pagination.limit,
				}}
			/>
		</div>
	);
}
