import { AppTable, type Column } from "@/components/common/AppTable";
import { FilterDrawer } from "@/components/common/FilterDrawer";
import { SearchBar } from "@/components/common/SearchBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/i18n/locale-context";
import { T } from "@/i18n/translate";
import { useT } from "@/i18n/use-t";
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
	const t = useT();
	const { locale } = useLocale();
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
		if (
			!confirm(
				t(
					"customers.list.status.confirm",
					'Are you sure you want to {action} "{name}"?',
					{
						action: t(
							newStatus
								? "customers.list.actions.activate"
								: "customers.list.actions.deactivate",
							newStatus ? "activate" : "deactivate",
						).toLowerCase(),
						name: `${customer.first_name} ${customer.last_name}`,
					},
				)
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
				t(
					"customers.list.status.success",
					'Customer {status} successfully',
					{
						status: t(
							newStatus
								? "customers.list.status.activated"
								: "customers.list.status.deactivated",
							newStatus ? "activated" : "deactivated",
						),
					},
				)
			);
		} catch {
			toast.error(
				t(
					"customers.list.status.failed",
					"Failed to update customer status",
				),
			);
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		}).format(date);
	};

	const columns: Column<CustomerListItem>[] = [
		{
			key: "name",
			header: t("customers.list.table.name", "Name"),
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
			header: t("customers.list.table.email", "Email"),
			render: (customer) => (
				<span className="text-muted-foreground">{customer.email}</span>
			),
		},
		{
			key: "mobile_number",
			header: t("customers.list.table.mobile", "Mobile"),
			render: (customer) => (
				<span className="text-muted-foreground">
					{customer.mobile_number}
				</span>
			),
		},
		{
			key: "is_email_verified",
			header: t("customers.list.table.emailVerified", "Email Verified"),
			render: (customer) => (
				<Badge
					variant={
						customer.is_email_verified ? "success" : "secondary"
					}
				>
					{customer.is_email_verified
						? t("customers.list.verified", "Verified")
						: t("customers.list.unverified", "Unverified")}
				</Badge>
			),
			className: "text-center",
		},
		{
			key: "is_mobile_verified",
			header: t("customers.list.table.mobileVerified", "Mobile Verified"),
			render: (customer) => (
				<Badge
					variant={
						customer.is_mobile_verified ? "success" : "secondary"
					}
				>
					{customer.is_mobile_verified
						? t("customers.list.verified", "Verified")
						: t("customers.list.unverified", "Unverified")}
				</Badge>
			),
			className: "text-center",
		},
		{
			key: "is_active",
			header: t("customers.list.table.status", "Status"),
			render: (customer) => (
				<Badge
					variant={customer.is_active ? "default" : "destructive"}
				>
					{customer.is_active
						? t("customers.list.status.active", "Active")
						: t("customers.list.status.inactive", "Inactive")}
				</Badge>
			),
		},
		{
			key: "created_at",
			header: t("customers.list.table.joined", "Joined"),
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
						<DropdownMenuLabel>
							<T id="customers.list.actions.label" defaultMessage="Actions" />
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() => handleToggleStatus(customer)}
							disabled={statusMutation.isPending}
						>
							{customer.is_active ? (
								<>
									<ShieldOff className="h-4 w-4 mr-2" />
									<T
										id="customers.list.actions.deactivate"
										defaultMessage="Deactivate"
									/>
								</>
							) : (
								<>
									<ShieldCheck className="h-4 w-4 mr-2" />
									<T
										id="customers.list.actions.activate"
										defaultMessage="Activate"
									/>
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
						<T id="customers.list.title" defaultMessage="Customers" />
					</h1>
					<p className="text-muted-foreground">
						<T
							id="customers.list.description"
							defaultMessage="Manage your customers and their accounts"
						/>
					</p>
				</div>
			</div>

			{/* Search and Filter Bar */}
			<div className="flex items-center gap-4">
				<SearchBar
					value={searchQuery}
					onChange={setSearchQuery}
					placeholder={t(
						"customers.list.searchPlaceholder",
						"Search by email, mobile, or name...",
					)}
					className="flex-1"
				/>
				<FilterDrawer
					open={isFilterOpen}
					onOpenChange={setIsFilterOpen}
					title={t("customers.filter.title", "Filters")}
					description={t(
						"customers.filter.description",
						"Apply filters to refine your customer list",
					)}
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
				emptyMessage={t("customers.list.empty", "No customers found")}
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
