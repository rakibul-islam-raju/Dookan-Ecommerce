import { AppTable, type Column } from "@/components/common/AppTable";
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
import { getSales, useDeleteSale, type SaleListItem } from "@/lib/api/sale";
import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { SaleFormModal } from "./components/SaleFormModal";

export function SaleList() {
	const t = useT();
	const { locale } = useLocale();
	const [currentPage, setCurrentPage] = useState(1);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalMode, setModalMode] = useState<"create" | "edit">("create");
	const [selectedSale, setSelectedSale] = useState<SaleListItem | null>(null);

	const { data, isLoading, error } = useQuery(
		getSales({
			limit: pagination.limit,
			offset: (currentPage - 1) * pagination.limit,
		})
	);

	const deleteMutation = useDeleteSale();

	const handleEdit = (sale: SaleListItem) => {
		setSelectedSale(sale);
		setModalMode("edit");
		setIsModalOpen(true);
	};

	const handleDelete = async (sale: SaleListItem) => {
		if (
			!confirm(
				t(
					"sales.deleteConfirm",
					'Are you sure you want to delete sale "{name}"?',
					{ name: sale.name },
				),
			)
		)
			return;

		try {
			await deleteMutation.mutateAsync(sale.id);
			toast.success(
				t("sales.toast.deleteSuccess", "Sale deleted successfully"),
			);
		} catch {
			toast.error(t("sales.toast.deleteFailed", "Failed to delete sale"));
		}
	};

	const formatDate = (dateStr: string) =>
		new Date(dateStr).toLocaleDateString(locale === "bn" ? "bn-BD" : "en-BD", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});

	const formatNumber = (value: string | number) =>
		new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-BD", {
			maximumFractionDigits: 2,
		}).format(Number(value));

	const columns: Column<SaleListItem>[] = [
		{
			key: "name",
			header: t("sales.table.name", "Sale Name"),
			render: (sale) => (
				<div>
					<p className="font-medium">{sale.name}</p>
					{sale.description && (
						<p className="text-xs text-muted-foreground truncate max-w-[200px]">
							{sale.description}
						</p>
					)}
				</div>
			),
		},
		{
			key: "discount",
			header: t("sales.table.discount", "Discount"),
			render: (sale) => (
				<span className="font-medium">
					{sale.discount_type === "percentage"
						? `${formatNumber(sale.discount_value)}%`
						: `৳${formatNumber(sale.discount_value)}`}
				</span>
			),
		},
		{
			key: "applies_to",
			header: t("sales.table.appliesTo", "Applies To"),
			render: (sale) => (
				<div>
					<span className="capitalize text-sm">
						{sale.applies_to === "all_products" &&
							t("sales.appliesTo.allProducts", "All products")}
						{sale.applies_to === "specific_categories" &&
							t("sales.appliesTo.specificCategories", "Specific categories")}
						{sale.applies_to === "specific_products" &&
							t("sales.appliesTo.specificProducts", "Specific products")}
					</span>
					{sale.applies_to === "specific_categories" && sale.category_count > 0 && (
						<p className="text-xs text-muted-foreground">
							{t(
								"sales.appliesTo.categoriesCount",
								"{count} categories",
								{ count: sale.category_count },
							)}
						</p>
					)}
					{sale.applies_to === "specific_products" && sale.product_count > 0 && (
						<p className="text-xs text-muted-foreground">
							{t("sales.appliesTo.productsCount", "{count} products", {
								count: sale.product_count,
							})}
						</p>
					)}
				</div>
			),
		},
		{
			key: "validity",
			header: t("sales.table.validity", "Valid Period"),
			render: (sale) => (
				<span className="text-muted-foreground text-xs">
					{formatDate(sale.valid_from)} - {formatDate(sale.valid_until)}
				</span>
			),
		},
		{
			key: "stacking",
			header: t("sales.table.stacking", "Coupon Stacking"),
			render: (sale) => (
				<Badge variant={sale.allow_coupon_stacking ? "secondary" : "outline"}>
					{sale.allow_coupon_stacking
						? t("sales.stacking.allowed", "Allowed")
						: t("sales.stacking.blocked", "Blocked")}
				</Badge>
			),
		},
		{
			key: "status",
			header: t("sales.table.status", "Status"),
			render: (sale) => (
				<div className="flex gap-1">
					<Badge variant={sale.is_active ? "default" : "secondary"}>
						{sale.is_active
							? t("sales.status.active", "Active")
							: t("sales.status.inactive", "Inactive")}
					</Badge>
					{sale.is_active && sale.is_currently_active && (
						<Badge variant="default" className="bg-green-600">
							{t("sales.status.live", "Live")}
						</Badge>
					)}
					{sale.is_active && !sale.is_currently_active && (
						<Badge variant="outline">
							{t("sales.status.scheduled", "Scheduled")}
						</Badge>
					)}
				</div>
			),
		},
		{
			key: "actions",
			header: "",
			render: (sale) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>
							<T id="sales.actions.label" defaultMessage="Actions" />
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => handleEdit(sale)}>
							<Pencil className="h-4 w-4 mr-2" />
							<T id="sales.actions.edit" defaultMessage="Edit" />
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => handleDelete(sale)}
							className="text-destructive"
							disabled={deleteMutation.isPending}
						>
							<Trash2 className="h-4 w-4 mr-2" />
							<T id="sales.actions.delete" defaultMessage="Delete" />
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
			className: "w-[50px]",
		},
	];

	const totalPages = data ? Math.ceil(data.count / pagination.limit) : 0;
	const sales = data?.results ?? [];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						<T id="sales.title" defaultMessage="Sales" />
					</h1>
					<p className="text-muted-foreground">
						<T
							id="sales.description"
							defaultMessage="Manage sales and promotional discounts"
						/>
					</p>
				</div>
				<Button
					onClick={() => {
						setModalMode("create");
						setSelectedSale(null);
						setIsModalOpen(true);
					}}
				>
					<Plus className="h-4 w-4 mr-2" />
					<T id="sales.create" defaultMessage="Create Sale" />
				</Button>
			</div>

			<AppTable
				data={sales}
				columns={columns}
				emptyMessage={
					isLoading
						? t("sales.loading", "Loading sales...")
						: error
							? t("sales.error", "Error loading sales")
							: t("sales.empty", "No sales found. Create your first sale!")
				}
				pagination={{
					currentPage,
					totalPages,
					onPageChange: setCurrentPage,
					pageSize: pagination.limit,
				}}
			/>

			<SaleFormModal
				open={isModalOpen}
				onOpenChange={setIsModalOpen}
				sale={selectedSale}
				mode={modalMode}
			/>
		</div>
	);
}
