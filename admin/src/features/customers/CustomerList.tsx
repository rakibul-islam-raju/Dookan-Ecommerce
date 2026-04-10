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
import {
	getCustomers,
	useUpdateCustomerStatus,
	type CustomerFilter,
} from "@/lib/api/customer";
import type { CustomerListItem } from "@/@types/User.type";
import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal, ShieldCheck, ShieldOff } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { CustomerFilterForm } from "./components/CustomerFilterForm";

const initialParams: CustomerFilter = {
	limit: pagination.limit,
	offset: 0,
};

export function CustomerList() {
	const { params, handleChangeParams, resetParams } = useFilterParams({
		initialParams,
	});
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [isFilterOpen, setIsFilterOpen] = useState(false);

	const debouncedSearchQuery = useDebouncedValue(searchQuery);

	const { data, isFetching } = useQuery(
		getCustomers({
			...params,
			search: debouncedSearchQuery || undefined,
			offset: (currentPage - 1) * pagination.limit,
		})
	);

	const statusMutation = useUpdateCustomerStatus();

	const handleToggleStatus = async (customer: CustomerListItem) => {
		const newStatus = !customer.is_active;
		const action = newStatus ? "activate" : "deactivate";
		if (
			!confirm(
				`Are you sure you want to ${action} "${customer.first_name} ${customer.last_name}"?`
			)
		) {
			return;
		}

		try {
			await statusMutation.mutateAsync({
				id: customer.id,
				is_active: newStatus,
			});
			toast.success(
				`Customer ${newStatus ? "activated" : "deactivated"} successfully`
			);
		} catch {
			toast.error("Failed to update customer status");
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

	const columns: Column<CustomerListItem>[] = [
		{
			key: "name",
			header: "Name",
			render: (customer) => (
				<Link
					to={`/customers/${customer.id}`}
					className="font-medium hover:underline"
				>
					{customer.first_name} {customer.last_name}
				</Link>
			),
		},
		{
			key: "email",
			header: "Email",
			render: (customer) => (
				<span className="text-muted-foreground">{customer.email}</span>
			),
		},
		{
			key: "mobile_number",
			header: "Mobile",
			render: (customer) => (
				<span className="text-muted-foreground">
					{customer.mobile_number}
				</span>
			),
		},
		{
			key: "is_email_verified",
			header: "Email Verified",
			render: (customer) => (
				<Badge
					variant={
						customer.is_email_verified ? "success" : "secondary"
					}
				>
					{customer.is_email_verified ? "Verified" : "Unverified"}
				</Badge>
			),
			className: "text-center",
		},
		{
			key: "is_mobile_verified",
			header: "Mobile Verified",
			render: (customer) => (
				<Badge
					variant={
						customer.is_mobile_verified ? "success" : "secondary"
					}
				>
					{customer.is_mobile_verified ? "Verified" : "Unverified"}
				</Badge>
			),
			className: "text-center",
		},
		{
			key: "is_active",
			header: "Status",
			render: (customer) => (
				<Badge
					variant={customer.is_active ? "default" : "destructive"}
				>
					{customer.is_active ? "Active" : "Inactive"}
				</Badge>
			),
		},
		{
			key: "created_at",
			header: "Joined",
			render: (customer) => (
				<span className="text-muted-foreground">
					{formatDate(customer.created_at)}
				</span>
			),
		},
		{
			key: "actions",
			header: "",
			render: (customer) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="sm"
							className="h-8 w-8 p-0"
						>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() => handleToggleStatus(customer)}
							disabled={statusMutation.isPending}
						>
							{customer.is_active ? (
								<>
									<ShieldOff className="h-4 w-4 mr-2" />
									Deactivate
								</>
							) : (
								<>
									<ShieldCheck className="h-4 w-4 mr-2" />
									Activate
								</>
							)}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
			className: "w-[50px]",
		},
	];

	const handleApplyFilters = (filter: CustomerFilter) => {
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

	const totalPages = data ? Math.ceil(data.count / pagination.limit) : 0;
	const customers = data?.results || [];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Customers
					</h1>
					<p className="text-muted-foreground">
						Manage your customers and their accounts
					</p>
				</div>
			</div>

			{/* Search and Filter Bar */}
			<div className="flex items-center gap-4">
				<SearchBar
					value={searchQuery}
					onChange={setSearchQuery}
					placeholder="Search by email, mobile, or name..."
					className="flex-1"
				/>
				<FilterDrawer
					open={isFilterOpen}
					onOpenChange={setIsFilterOpen}
				>
					<CustomerFilterForm
						initialFilter={params}
						onFilter={handleApplyFilters}
						onReset={handleResetFilters}
					/>
				</FilterDrawer>
			</div>

			{/* Customers Table */}
			<AppTable
				data={customers}
				columns={columns}
				isLoading={isFetching}
				emptyMessage="No customers found"
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
