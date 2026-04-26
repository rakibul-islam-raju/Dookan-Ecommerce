import { AppTable, type Column } from "@/components/common/AppTable";
import { AppConfirmDialog } from "@/components/@app/AppConfirmDialog";
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
import { getMaterials, useDeleteMaterial, type IMaterial } from "@/lib/api/inventory";
import { useQuery } from "@tanstack/react-query";
import { Layers, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { MaterialFormModal } from "./components/MaterialFormModal";

export function MaterialList() {
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
			toast.success("Material deleted");
		} catch {
			toast.error("Failed to delete material");
		} finally {
			setDeleteDialogOpen(false);
			setMaterialToDelete(null);
		}
	};

	const formatQty = (qty: string, unit: string) =>
		`${parseFloat(qty).toLocaleString()} ${unit}`;

	const isLowStock = (material: IMaterial) =>
		parseFloat(material.current_quantity) <= parseFloat(material.reorder_level);

	const columns: Column<IMaterial>[] = [
		{
			key: "name",
			header: "Name",
			render: (m) => <span className="font-medium">{m.name}</span>,
		},
		{
			key: "sku",
			header: "SKU",
			render: (m) => <span className="font-mono text-sm text-muted-foreground">{m.sku}</span>,
		},
		{
			key: "category",
			header: "Category",
			render: (m) => (
				<span className="text-sm text-muted-foreground">{m.category_name || "—"}</span>
			),
		},
		{
			key: "current_quantity",
			header: "Current Stock",
			render: (m) => (
				<div className="flex items-center gap-2">
					<span className="tabular-nums font-medium">{formatQty(m.current_quantity, m.unit)}</span>
					{isLowStock(m) && (
						<Badge variant="outline" className="text-orange-500 border-orange-300 text-xs">
							Low Stock
						</Badge>
					)}
				</div>
			),
		},
		{
			key: "reorder_level",
			header: "Reorder Level",
			render: (m) => (
				<span className="tabular-nums text-sm text-muted-foreground">
					{formatQty(m.reorder_level, m.unit)}
				</span>
			),
		},
		{
			key: "weighted_average_cost",
			header: "Avg Cost",
			render: (m) => (
				<span className="tabular-nums text-sm">
					৳{parseFloat(m.weighted_average_cost).toFixed(2)}
				</span>
			),
			className: "text-right",
		},
		{
			key: "is_active",
			header: "Status",
			render: (m) =>
				m.is_active ? (
					<Badge variant="default">Active</Badge>
				) : (
					<Badge variant="secondary">Inactive</Badge>
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
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => navigate(`/inventory/materials/${m.id}`)}>
							<Layers className="h-4 w-4 mr-2" />
							View Details
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => handleEdit(m)}>
							<Pencil className="h-4 w-4 mr-2" />
							Edit
						</DropdownMenuItem>
						<DropdownMenuItem
							className="text-destructive"
							onClick={() => handleDeleteClick(m)}
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

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Raw Materials</h1>
					<p className="text-muted-foreground mt-1">
						Raw materials are the inputs for your production batches. Track current
						stock, costs, and set reorder alerts.
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
					Add Material
				</Button>
			</div>

			<SearchBar
				value={searchQuery}
				onChange={setSearchQuery}
				placeholder="Search materials by name or SKU..."
			/>

			<AppTable
				data={data?.results || []}
				columns={columns}
				isLoading={isLoading}
				rowKey={(m) => m.id}
				onRowClick={(m) => navigate(`/inventory/materials/${m.id}`)}
				emptyMessage={
					error
						? "Error loading materials"
						: searchQuery
							? `No materials found for "${searchQuery}"`
							: "No materials yet. Add your first raw material to start tracking stock for production batches."
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
				title="Delete Material"
				description={`Are you sure you want to delete "${materialToDelete?.name}"? This cannot be undone.`}
				confirmButtonText="Delete"
				cancelButtonText="Cancel"
				confirmButtonVariant="destructive"
				onConfirm={handleConfirmDelete}
				onCancel={() => setDeleteDialogOpen(false)}
			/>
		</div>
	);
}
