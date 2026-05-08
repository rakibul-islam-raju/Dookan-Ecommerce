import { AppTable, type Column } from "@/components/common/AppTable";
import { AppConfirmDialog } from "@/components/@app/AppConfirmDialog";
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
import { getMaterials, useDeleteMaterial, type IMaterial } from "@/lib/api/inventory";
import { useQuery } from "@tanstack/react-query";
import { Layers, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MaterialFormModal } from "./components/MaterialFormModal";

export function MaterialList() {
	const t = useT();
	const { locale } = useLocale();
	const navigate = useNavigate();
	const [searchQuery, setSearchQuery] = useState("");
	const debouncedSearch = useDebouncedValue(searchQuery, 400);
	const [currentPage, setCurrentPage] = useState(1);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalMode, setModalMode] = useState<"create" | "edit">("create");
	const [selectedMaterial, setSelectedMaterial] = useState<IMaterial | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [materialToDelete, setMaterialToDelete] = useState<IMaterial | null>(null);

	const { data, isLoading, error } = useQuery(
		getMaterials({
			limit: pagination.limit,
			offset: (currentPage - 1) * pagination.limit,
			search: debouncedSearch || undefined,
		}),
	);

	const deleteMutation = useDeleteMaterial();

	const handleEdit = (material: IMaterial) => {
		setSelectedMaterial(material);
		setModalMode("edit");
		setIsModalOpen(true);
	};

	const handleDeleteClick = (material: IMaterial) => {
		setMaterialToDelete(material);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!materialToDelete) return;
		try {
			await deleteMutation.mutateAsync(materialToDelete.id);
			toast.success(t("inventory.materials.deleteSuccess", "Material deleted"));
		} catch {
			toast.error(t("inventory.materials.deleteFailed", "Failed to delete material"));
		} finally {
			setDeleteDialogOpen(false);
			setMaterialToDelete(null);
		}
	};

	const formatQty = (qty: string, unit: string) =>
		`${parseFloat(qty).toLocaleString(locale === "bn" ? "bn-BD" : "en-IN")} ${unit}`;

	const isLowStock = (material: IMaterial) =>
		parseFloat(material.current_quantity) <= parseFloat(material.reorder_level);

	const columns: Column<IMaterial>[] = [
		{
			key: "name",
			header: t("inventory.materials.table.name", "Name"),
			render: (m) => <span className="font-medium">{m.name}</span>,
		},
		{
			key: "sku",
			header: t("inventory.materials.table.sku", "SKU"),
			render: (m) => <span className="font-mono text-sm text-muted-foreground">{m.sku}</span>,
		},
		{
			key: "category",
			header: t("inventory.materials.table.category", "Category"),
			render: (m) => (
				<span className="text-sm text-muted-foreground">
					{m.category_name || t("inventory.common.empty", "—")}
				</span>
			),
		},
		{
			key: "current_quantity",
			header: t("inventory.materials.table.currentStock", "Current Stock"),
			render: (m) => (
				<div className="flex items-center gap-2">
					<span className="tabular-nums font-medium">{formatQty(m.current_quantity, m.unit)}</span>
					{isLowStock(m) && (
						<Badge variant="outline" className="text-orange-500 border-orange-300 text-xs">
							<T id="inventory.materials.lowStock" defaultMessage="Low Stock" />
						</Badge>
					)}
				</div>
			),
		},
		{
			key: "reorder_level",
			header: t("inventory.materials.table.reorderLevel", "Reorder Level"),
			render: (m) => (
				<span className="tabular-nums text-sm text-muted-foreground">
					{formatQty(m.reorder_level, m.unit)}
				</span>
			),
		},
		{
			key: "weighted_average_cost",
			header: t("inventory.materials.table.avgCost", "Avg Cost"),
			render: (m) => (
				<span className="tabular-nums text-sm">
					{`৳${parseFloat(m.weighted_average_cost).toLocaleString(locale === "bn" ? "bn-BD" : "en-IN", {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					})}`}
				</span>
			),
			className: "text-right",
		},
		{
			key: "is_active",
			header: t("inventory.materials.table.status", "Status"),
			render: (m) =>
				m.is_active ? (
					<Badge variant="default">
						<T id="inventory.status.active" defaultMessage="Active" />
					</Badge>
				) : (
					<Badge variant="secondary">
						<T id="inventory.status.inactive" defaultMessage="Inactive" />
					</Badge>
				),
		},
		{
			key: "actions",
			header: "",
			render: (m) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>
							<T id="inventory.actions.label" defaultMessage="Actions" />
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => navigate(`/inventory/materials/${m.id}`)}>
							<Layers className="h-4 w-4 mr-2" />
							<T id="inventory.actions.viewDetails" defaultMessage="View Details" />
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => handleEdit(m)}>
							<Pencil className="h-4 w-4 mr-2" />
							<T id="inventory.actions.edit" defaultMessage="Edit" />
						</DropdownMenuItem>
						<DropdownMenuItem
							className="text-destructive"
							onClick={() => handleDeleteClick(m)}
						>
							<Trash2 className="h-4 w-4 mr-2" />
							<T id="inventory.actions.delete" defaultMessage="Delete" />
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
			className: "w-[50px]",
		},
	];

	const totalPages = data ? Math.ceil(data.count / pagination.limit) : 0;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						<T id="inventory.materials.title" defaultMessage="Raw Materials" />
					</h1>
					<p className="text-muted-foreground mt-1">
						<T
							id="inventory.materials.description"
							defaultMessage="Raw materials are the inputs for your production batches. Track current stock, costs, and set reorder alerts."
						/>
					</p>
				</div>
				<Button
					onClick={() => {
						setModalMode("create");
						setSelectedMaterial(null);
						setIsModalOpen(true);
					}}
				>
					<Plus className="h-4 w-4 mr-2" />
					<T id="inventory.materials.add" defaultMessage="Add Material" />
				</Button>
			</div>

			<SearchBar
				value={searchQuery}
				onChange={setSearchQuery}
				placeholder={t(
					"inventory.materials.searchPlaceholder",
					"Search materials by name or SKU...",
				)}
			/>

			<AppTable
				data={data?.results || []}
				columns={columns}
				isLoading={isLoading}
				rowKey={(m) => m.id}
				onRowClick={(m) => navigate(`/inventory/materials/${m.id}`)}
				emptyMessage={
					error
						? t("inventory.materials.error", "Error loading materials")
						: searchQuery
							? t("inventory.materials.empty.search", 'No materials found for "{query}"', {
								query: searchQuery,
							})
							: t(
								"inventory.materials.empty.default",
								"No materials yet. Add your first raw material to start tracking stock for production batches.",
							)
				}
				pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }}
			/>

			<MaterialFormModal
				open={isModalOpen}
				onOpenChange={setIsModalOpen}
				material={selectedMaterial}
				mode={modalMode}
			/>

			<AppConfirmDialog
				open={deleteDialogOpen}
				title={t("inventory.materials.deleteTitle", "Delete Material")}
				description={t(
					"inventory.materials.deleteDescription",
					'Are you sure you want to delete "{name}"? This cannot be undone.',
					{ name: materialToDelete?.name ?? "" },
				)}
				confirmButtonText={t("inventory.actions.delete", "Delete")}
				cancelButtonText={t("common.cancel", "Cancel")}
				confirmButtonVariant="destructive"
				onConfirm={handleConfirmDelete}
				onCancel={() => setDeleteDialogOpen(false)}
			/>
		</div>
	);
}
