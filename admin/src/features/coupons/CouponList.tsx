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
import { useFilterParams } from "@/hooks/useFilterParams";
import {
	getCoupons,
	useDeleteCoupon,
	type CouponFilter,
	type CouponListItem,
} from "@/lib/api/coupon";
import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { CouponFilterForm } from "./components/CouponFilterForm";
import { CouponFormModal } from "./components/CouponFormModal";

const initialParams: CouponFilter = {
	limit: pagination.limit,
	offset: 0,
};

export function CouponList() {
	const t = useT();
	const { locale } = useLocale();
	const { params, handleChangeParams, resetParams } = useFilterParams({
		initialParams,
	});
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalMode, setModalMode] = useState<"create" | "edit">("create");
	const [selectedCoupon, setSelectedCoupon] =
		useState<CouponListItem | null>(null);

	const { data, isLoading, error } = useQuery(
		getCoupons({
			...params,
			search: searchQuery || undefined,
			offset: (currentPage - 1) * pagination.limit,
		})
	);

	const deleteMutation = useDeleteCoupon();

	const handleEdit = (coupon: CouponListItem) => {
		setSelectedCoupon(coupon);
		setModalMode("edit");
		setIsModalOpen(true);
	};

	const handleDelete = async (coupon: CouponListItem) => {
		if (
			!confirm(
				t(
					"coupons.list.deleteConfirm",
					'Are you sure you want to delete coupon "{code}"?',
					{ code: coupon.code },
				),
			)
		) {
			return;
		}
		try {
			await deleteMutation.mutateAsync(coupon.id);
			toast.success(
				t("coupons.list.deleteSuccess", "Coupon deleted successfully"),
			);
		} catch {
			toast.error(t("coupons.list.deleteFailed", "Failed to delete coupon"));
		}
	};

	const formatDate = (dateStr: string) => {
		return new Date(dateStr).toLocaleDateString(
			locale === "bn" ? "bn-BD" : "en-US",
			{
			month: "short",
			day: "numeric",
			year: "numeric",
			},
		);
	};

	const columns: Column<CouponListItem>[] = [
		{
			key: "code",
			header: t("coupons.list.table.code", "Code"),
			render: (coupon) => (
				<span className="font-mono font-semibold">{coupon.code}</span>
			),
		},
		{
			key: "discount",
			header: t("coupons.list.table.discount", "Discount"),
			render: (coupon) => (
				<span>
					{coupon.discount_type === "percentage"
						? `${Number(coupon.discount_value).toLocaleString(
							locale === "bn" ? "bn-BD" : "en-IN",
						)}%`
						: `৳${Number(coupon.discount_value).toLocaleString(
							locale === "bn" ? "bn-BD" : "en-IN",
							{
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							},
						)}`}
				</span>
			),
		},
		{
			key: "min_order",
			header: t("coupons.list.table.minOrder", "Min Order"),
			render: (coupon) => (
				<span className="text-muted-foreground">
					{parseFloat(coupon.min_order_amount) > 0
						? `৳${Number(coupon.min_order_amount).toLocaleString(
							locale === "bn" ? "bn-BD" : "en-IN",
							{
								minimumFractionDigits: 2,
								maximumFractionDigits: 2,
							},
						)}`
						: t("coupons.list.table.empty", "-")}
				</span>
			),
		},
		{
			key: "usage",
			header: t("coupons.list.table.usage", "Usage"),
			render: (coupon) => (
				<span className="text-muted-foreground">
					{coupon.used_count.toLocaleString(
						locale === "bn" ? "bn-BD" : "en-IN",
					)}
					{coupon.max_uses
						? ` / ${coupon.max_uses.toLocaleString(
							locale === "bn" ? "bn-BD" : "en-IN",
						)}`
						: ""}
				</span>
			),
		},
		{
			key: "validity",
			header: t("coupons.list.table.validity", "Valid Period"),
			render: (coupon) => (
				<span className="text-muted-foreground text-xs">
					{formatDate(coupon.valid_from)} - {formatDate(coupon.valid_until)}
				</span>
			),
		},
		{
			key: "status",
			header: t("coupons.list.table.status", "Status"),
			render: (coupon) => (
				<div className="flex gap-1">
					<Badge variant={coupon.is_active ? "default" : "secondary"}>
						{coupon.is_active
							? t("coupons.list.status.active", "Active")
							: t("coupons.list.status.inactive", "Inactive")}
					</Badge>
					{coupon.is_active && !coupon.is_valid && (
						<Badge variant="destructive">
							<T id="coupons.list.status.expired" defaultMessage="Expired" />
						</Badge>
					)}
				</div>
			),
		},
		{
			key: "actions",
			header: "",
			render: (coupon) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>
							<T id="coupons.list.actions.label" defaultMessage="Actions" />
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => handleEdit(coupon)}>
							<Pencil className="h-4 w-4 mr-2" />
							<T id="coupons.list.actions.edit" defaultMessage="Edit" />
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => handleDelete(coupon)}
							className="text-destructive"
							disabled={deleteMutation.isPending}
						>
							<Trash2 className="h-4 w-4 mr-2" />
							<T id="coupons.list.actions.delete" defaultMessage="Delete" />
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
			className: "w-[50px]",
		},
	];

	const handleApplyFilters = (filter: CouponFilter) => {
		handleChangeParams({ ...filter, offset: 0 });
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
	const coupons = data?.results || [];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						<T id="coupons.list.title" defaultMessage="Coupons" />
					</h1>
					<p className="text-muted-foreground">
						<T
							id="coupons.list.description"
							defaultMessage="Manage discount coupons for your store"
						/>
					</p>
				</div>
				<Button
					onClick={() => {
						setModalMode("create");
						setSelectedCoupon(null);
						setIsModalOpen(true);
					}}
				>
					<Plus className="h-4 w-4 mr-2" />
					<T id="coupons.list.add" defaultMessage="Add Coupon" />
				</Button>
			</div>

			{/* Search and Filter Bar */}
			<div className="flex items-center gap-4">
				<SearchBar
					value={searchQuery}
					onChange={setSearchQuery}
					placeholder={t(
						"coupons.list.searchPlaceholder",
						"Search coupons by code...",
					)}
					className="flex-1"
				/>
				<FilterDrawer
					open={isFilterOpen}
					onOpenChange={setIsFilterOpen}
					title={t("coupons.filter.title", "Filters")}
					description={t(
						"coupons.filter.description",
						"Apply filters to refine your coupon list",
					)}
				>
					<CouponFilterForm
						initialFilter={params}
						onFilter={handleApplyFilters}
						onReset={handleResetFilters}
					/>
				</FilterDrawer>
			</div>

			{/* Coupons Table */}
			<AppTable
				data={coupons}
				columns={columns}
				emptyMessage={
					isLoading
						? t("coupons.list.loading", "Loading coupons...")
						: error
							? t("coupons.list.error", "Error loading coupons")
							: t("coupons.list.empty", "No coupons found")
				}
				pagination={{
					currentPage,
					totalPages,
					onPageChange: setCurrentPage,
					pageSize: pagination.limit,
				}}
			/>

			{/* Coupon Form Modal */}
			<CouponFormModal
				open={isModalOpen}
				onOpenChange={setIsModalOpen}
				coupon={selectedCoupon}
				mode={modalMode}
			/>
		</div>
	);
}
