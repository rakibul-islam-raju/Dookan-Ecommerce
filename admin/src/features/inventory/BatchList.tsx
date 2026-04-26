import { AppTable, type Column } from "@/components/common/AppTable";
import { AppConfirmDialog } from "@/components/@app/AppConfirmDialog";
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
import { getBatches, useDeleteBatch, type IProductionBatch } from "@/lib/api/inventory";
import { useQuery } from "@tanstack/react-query";
import { Eye, Factory, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function BatchStatusBadge({ status }: { status: IProductionBatch["status"] }) {
	const map: Record<
		IProductionBatch["status"],
		{ label: string; variant: "default" | "secondary" | "destructive" | "outline" }
	> = {
		draft: { label: "Draft", variant: "secondary" },
		in_progress: { label: "In Progress", variant: "outline" },
		completed: { label: "Completed", variant: "default" },
		cancelled: { label: "Cancelled", variant: "destructive" },
	};
	const { label, variant } = map[status];
	return <Badge variant={variant}>{label}</Badge>;
}

export function BatchList() {
	const navigate = useNavigate();
	const [currentPage, setCurrentPage] = useState(1);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [batchToDelete, setBatchToDelete] = useState<IProductionBatch | null>(null);

	const { data, isLoading, error } = useQuery(
		getBatches({
			limit: pagination.limit,
			offset: (currentPage - 1) * pagination.limit,
		}),
	);

	const deleteMutation = useDeleteBatch();

	const handleDeleteClick = (batch: IProductionBatch) => {
		setBatchToDelete(batch);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!batchToDelete) return;
		try {
			await deleteMutation.mutateAsync(batchToDelete.id);
			toast.success("Batch deleted");
		} catch {
			toast.error("Failed to delete batch. Only draft batches can be deleted.");
		} finally {
			setDeleteDialogOpen(false);
			setBatchToDelete(null);
		}
	};

	const formatDate = (date: string | null) =>
		date
			? new Date(date).toLocaleDateString("en-GB", {
					day: "2-digit",
					month: "short",
					year: "numeric",
				})
			: "—";

	const columns: Column<IProductionBatch>[] = [
		{
			key: "code",
			header: "Batch Code",
			render: (b) => <span className="font-mono font-medium">{b.code}</span>,
		},
		{
			key: "status",
			header: "Status",
			render: (b) => <BatchStatusBadge status={b.status} />,
		},
		{
			key: "materials",
			header: "Materials",
			render: (b) => (
				<span className="text-sm text-muted-foreground">{b.materials.length}</span>
			),
			className: "text-center",
		},
		{
			key: "outputs",
			header: "Outputs",
			render: (b) => (
				<span className="text-sm text-muted-foreground">{b.outputs.length}</span>
			),
			className: "text-center",
		},
		{
			key: "started_at",
			header: "Started",
			render: (b) => <span className="text-sm">{formatDate(b.started_at)}</span>,
		},
		{
			key: "completed_at",
			header: "Completed",
			render: (b) => <span className="text-sm">{formatDate(b.completed_at)}</span>,
		},
		{
			key: "actions",
			header: "",
			render: (b) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>Actions</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => navigate(`/inventory/batches/${b.id}`)}>
							<Eye className="h-4 w-4 mr-2" />
							View Details
						</DropdownMenuItem>
						{b.status === "draft" && (
							<DropdownMenuItem
								className="text-destructive"
								onClick={() => handleDeleteClick(b)}
							>
								<Trash2 className="h-4 w-4 mr-2" />
								Delete
							</DropdownMenuItem>
						)}
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
					<h1 className="text-3xl font-bold tracking-tight">Production Batches</h1>
					<p className="text-muted-foreground mt-1">
						A production batch tracks the raw materials consumed and finished goods
						produced in a single production run.
					</p>
				</div>
				<Button onClick={() => navigate("/inventory/batches/create")}>
					<Plus className="h-4 w-4 mr-2" />
					New Batch
				</Button>
			</div>

			<AppTable
				data={data?.results || []}
				columns={columns}
				isLoading={isLoading}
				rowKey={(b) => b.id}
				onRowClick={(b) => navigate(`/inventory/batches/${b.id}`)}
				emptyMessage={
					error
						? "Error loading batches"
						: "No production batches yet. Create a batch to record a production run."
				}
				pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }}
			/>

			<AppConfirmDialog
				open={deleteDialogOpen}
				title="Delete Batch"
				description={`Are you sure you want to delete batch "${batchToDelete?.code}"? Only draft batches can be deleted.`}
				confirmButtonText="Delete"
				cancelButtonText="Cancel"
				confirmButtonVariant="destructive"
				onConfirm={handleConfirmDelete}
				onCancel={() => setDeleteDialogOpen(false)}
			/>
		</div>
	);
}
