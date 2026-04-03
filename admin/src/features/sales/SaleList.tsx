import { AppTable, type Column } from "@/components/common/AppTable";
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
import { getSales, useDeleteSale, type SaleListItem } from "@/lib/api/sale";
import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { SaleFormModal } from "./components/SaleFormModal";

export function SaleList() {
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
		if (!confirm(`Are you sure you want to delete sale "${sale.name}"?`)) return;
		try {
			await deleteMutation.mutateAsync(sale.id);
			toast.success("Sale deleted successfully");
		} catch {
			toast.error("Failed to delete sale");
		}
	};

	const formatDate = (dateStr: string) =>
		new Date(dateStr).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		});

	const columns: Column<SaleListItem>[] = [
		{
			key: "name",
			header: "Sale Name",
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
			header: "Discount",
			render: (sale) => (
				<span className="font-medium">
					{sale.discount_type === "percentage"
						? `${sale.discount_value}%`
						: `৳${sale.discount_value}`}
				</span>
			),
		},
		{
			key: "applies_to",
			header: "Applies To",
			render: (sale) => (
				<div>
					<span className="capitalize text-sm">
						{sale.applies_to.replace(/_/g, " ")}
					</span>
					{sale.applies_to === "specific_categories" && sale.category_count > 0 && (
						<p className="text-xs text-muted-foreground">
							{sale.category_count} categor{sale.category_count === 1 ? "y" : "ies"}
						</p>
					)}
					{sale.applies_to === "specific_products" && sale.product_count > 0 && (
						<p className="text-xs text-muted-foreground">
							{sale.product_count} product{sale.product_count === 1 ? "" : "s"}
						</p>
					)}
				</div>
			),
		},
		{
			key: "validity",
			header: "Valid Period",
			render: (sale) => (
				<span className="text-muted-foreground text-xs">
					{formatDate(sale.valid_from)} – {formatDate(sale.valid_until)}
				</span>
			),
		},
		{
			key: "stacking",
			header: "Coupon Stacking",
			render: (sale) => (
				<Badge variant={sale.allow_coupon_stacking ? "secondary" : "outline"}>
					{sale.allow_coupon_stacking ? "Allowed" : "Blocked"}
				</Badge>
			),
		},
		{
			key: "status",
			header: "Status",
			render: (sale) => (
				<div className="flex gap-1">
					<Badge variant={sale.is_active ? "default" : "secondary"}>
						{sale.is_active ? "Active" : "Inactive"}
					</Badge>
					{sale.is_active && sale.is_currently_active && (
						<Badge variant="default" className="bg-green-600">Live</Badge>
					)}
					{sale.is_active && !sale.is_currently_active && (
						<Badge variant="outline">Scheduled</Badge>
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
						<Button variant="ghost" size="sm" className="h-8 w-8 p0">
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => handleEdit(sale)}>
							<Pencil className="h-4 w-4 mr-2" />
							Edit
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => handleDelete(sale)}
							className="text-destructive"
							disabled={deleteMutation.isPending}
						>
							<Trash2 className="h-4 w-4 mr-2" />
							Delete
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
					<h1 className="text-3xl font-bold tracking-tight">Sales</h1>
					<p className="text-muted-foreground">
						Manage sales and promotional discounts
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
					Create Sale
				</Button>
			</div>

			<AppTable
				data={sales}
				columns={columns}
				emptyMessage={
					isLoading
						? "Loading sales..."
						: error
							? "Error loading sales"
							: "No sales found. Create your first sale!"
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
