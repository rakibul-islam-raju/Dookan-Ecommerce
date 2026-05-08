import { AppTable, type Column } from "@/components/common/AppTable";
import { AppConfirmDialog } from "@/components/@app/AppConfirmDialog";
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
import { getBatches, useDeleteBatch, type IProductionBatch } from "@/lib/api/inventory";
import { useQuery } from "@tanstack/react-query";
import { Eye, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function BatchStatusBadge({
	status,
	labels,
}: {
	status: IProductionBatch["status"];
	labels: Record<IProductionBatch["status"], string>;
}) {
	const map: Record<
		IProductionBatch["status"],
		{ label: string; variant: "default" | "secondary" | "destructive" | "outline" }
	> = {
		draft: { label: labels.draft, variant: "secondary" },
		in_progress: { label: labels.in_progress, variant: "outline" },
		completed: { label: labels.completed, variant: "default" },
		cancelled: { label: labels.cancelled, variant: "destructive" },
	};
	const { label, variant } = map[status];
	return <Badge variant={variant}>{label}</Badge>;
}

export function BatchList() {
	const t = useT();
	const { locale } = useLocale();
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
			toast.success(t("inventory.batches.deleteSuccess", "Batch deleted"));
		} catch {
			toast.error(
				t(
					"inventory.batches.deleteFailed",
					"Failed to delete batch. Only draft batches can be deleted.",
				),
			);
		} finally {
			setDeleteDialogOpen(false);
			setBatchToDelete(null);
		}
	};

	const formatDate = (date: string | null) =>
		date
			? new Date(date).toLocaleDateString(locale === "bn" ? "bn-BD" : "en-GB", {
					day: "2-digit",
					month: "short",
					year: "numeric",
				})
			: t("inventory.common.empty", "—");

	const statusLabels: Record<IProductionBatch["status"], string> = {
		draft: t("inventory.batchStatus.draft", "Draft"),
		in_progress: t("inventory.batchStatus.inProgress", "In Progress"),
		completed: t("inventory.batchStatus.completed", "Completed"),
		cancelled: t("inventory.batchStatus.cancelled", "Cancelled"),
	};

	const columns: Column<IProductionBatch>[] = [
		{
			key: "code",
			header: t("inventory.batches.table.code", "Batch Code"),
			render: (b) => <span className="font-mono font-medium">{b.code}</span>,
		},
		{
			key: "status",
			header: t("inventory.batches.table.status", "Status"),
			render: (b) => <BatchStatusBadge status={b.status} labels={statusLabels} />,
		},
		{
			key: "materials",
			header: t("inventory.batches.table.materials", "Materials"),
			render: (b) => (
				<span className="text-sm text-muted-foreground">
					{b.materials.length.toLocaleString(locale === "bn" ? "bn-BD" : "en-IN")}
				</span>
			),
			className: "text-center",
		},
		{
			key: "outputs",
			header: t("inventory.batches.table.outputs", "Outputs"),
			render: (b) => (
				<span className="text-sm text-muted-foreground">
					{b.outputs.length.toLocaleString(locale === "bn" ? "bn-BD" : "en-IN")}
				</span>
			),
			className: "text-center",
		},
		{
			key: "started_at",
			header: t("inventory.batches.table.started", "Started"),
			render: (b) => <span className="text-sm">{formatDate(b.started_at)}</span>,
		},
		{
			key: "completed_at",
			header: t("inventory.batches.table.completed", "Completed"),
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
						<DropdownMenuLabel>
							<T id="inventory.actions.label" defaultMessage="Actions" />
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => navigate(`/inventory/batches/${b.id}`)}>
							<Eye className="h-4 w-4 mr-2" />
							<T id="inventory.actions.viewDetails" defaultMessage="View Details" />
						</DropdownMenuItem>
						{b.status === "draft" && (
							<DropdownMenuItem
								className="text-destructive"
								onClick={() => handleDeleteClick(b)}
							>
								<Trash2 className="h-4 w-4 mr-2" />
								<T id="inventory.actions.delete" defaultMessage="Delete" />
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
					<h1 className="text-3xl font-bold tracking-tight">
						<T id="inventory.batches.title" defaultMessage="Production Batches" />
					</h1>
					<p className="text-muted-foreground mt-1">
						<T
							id="inventory.batches.description"
							defaultMessage="A production batch tracks the raw materials consumed and finished goods produced in a single production run."
						/>
					</p>
				</div>
				<Button onClick={() => navigate("/inventory/batches/create")}>
					<Plus className="h-4 w-4 mr-2" />
					<T id="inventory.batches.add" defaultMessage="New Batch" />
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
						? t("inventory.batches.error", "Error loading batches")
						: t(
							"inventory.batches.empty",
							"No production batches yet. Create a batch to record a production run.",
						)
				}
				pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }}
			/>

			<AppConfirmDialog
				open={deleteDialogOpen}
				title={t("inventory.batches.deleteTitle", "Delete Batch")}
				description={t(
					"inventory.batches.deleteDescription",
					'Are you sure you want to delete batch "{code}"? Only draft batches can be deleted.',
					{ code: batchToDelete?.code ?? "" },
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
