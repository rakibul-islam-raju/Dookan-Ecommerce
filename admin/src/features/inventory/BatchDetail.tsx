import { AppConfirmDialog } from "@/components/@app/AppConfirmDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useLocale } from "@/i18n/locale-context";
import { T } from "@/i18n/translate";
import { useT } from "@/i18n/use-t";
import { getBatch, useCompleteBatch, useUpdateBatch } from "@/lib/api/inventory";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import type { IProductionBatch } from "@/lib/api/inventory";

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

export function BatchDetail() {
	const t = useT();
	const { locale } = useLocale();
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
	const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

	const { data: batch, isLoading } = useQuery(getBatch(id!));
	const completeMutation = useCompleteBatch();
	const updateMutation = useUpdateBatch();

	const handleComplete = async () => {
		try {
			await completeMutation.mutateAsync(id!);
			toast.success(t("inventory.batchDetail.completeSuccess", "Batch completed. Stock and costs updated."));
		} catch {
			toast.error(
				t(
					"inventory.batchDetail.completeFailed",
					"Failed to complete batch. Check materials and outputs.",
				),
			);
		} finally {
			setCompleteDialogOpen(false);
		}
	};

	const handleCancel = async () => {
		try {
			await updateMutation.mutateAsync({ id: id!, data: { status: "cancelled" } });
			toast.success(t("inventory.batchDetail.cancelSuccess", "Batch cancelled"));
		} catch {
			toast.error(t("inventory.batchDetail.cancelFailed", "Failed to cancel batch"));
		} finally {
			setCancelDialogOpen(false);
		}
	};

	const handleMarkInProgress = async () => {
		try {
			await updateMutation.mutateAsync({ id: id!, data: { status: "in_progress" } });
			toast.success(t("inventory.batchDetail.inProgressSuccess", "Batch marked as In Progress"));
		} catch {
			toast.error(t("inventory.batchDetail.inProgressFailed", "Failed to update batch status"));
		}
	};

	const formatAmount = (amount: string | null) =>
		amount
			? `৳${parseFloat(amount).toLocaleString(locale === "bn" ? "bn-BD" : "en-IN", {
				minimumFractionDigits: 2,
			})}`
			: t("inventory.common.empty", "—");

	const formatDate = (date: string | null) =>
		date
			? new Date(date).toLocaleDateString(locale === "bn" ? "bn-BD" : "en-GB", {
				day: "2-digit",
				month: "short",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			})
			: t("inventory.common.empty", "—");

	const statusLabels: Record<IProductionBatch["status"], string> = {
		draft: t("inventory.batchStatus.draft", "Draft"),
		in_progress: t("inventory.batchStatus.inProgress", "In Progress"),
		completed: t("inventory.batchStatus.completed", "Completed"),
		cancelled: t("inventory.batchStatus.cancelled", "Cancelled"),
	};

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="h-8 w-64 bg-muted animate-pulse rounded" />
				<div className="h-96 bg-muted animate-pulse rounded" />
			</div>
		);
	}

	if (!batch) {
		return (
			<div className="text-center py-12 text-muted-foreground">
				<T id="inventory.batchDetail.notFound" defaultMessage="Batch not found." />
			</div>
		);
	}

	const isEditable = batch.status === "draft" || batch.status === "in_progress";
	const canComplete = batch.status === "in_progress";
	const canMarkInProgress = batch.status === "draft";

	return (
		<div className="space-y-6">
			{/* Breadcrumb */}
			<Button variant="ghost" size="sm" onClick={() => navigate("/inventory/batches")}>
				<ArrowLeft className="h-4 w-4 mr-1" />
				<T id="inventory.batches.title" defaultMessage="Production Batches" />
			</Button>

			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<h1 className="text-3xl font-bold tracking-tight font-mono">
						{batch.code}
					</h1>
					<BatchStatusBadge status={batch.status} labels={statusLabels} />
				</div>

				{isEditable && (
					<div className="flex items-center gap-2">
						{canMarkInProgress && (
							<Button
								variant="outline"
								size="sm"
								onClick={handleMarkInProgress}
								disabled={updateMutation.isPending}
							>
								<T
									id="inventory.batchDetail.markInProgress"
									defaultMessage="Mark In Progress"
								/>
							</Button>
						)}
						{canComplete && (
							<Button
								size="sm"
								onClick={() => setCompleteDialogOpen(true)}
								disabled={completeMutation.isPending}
							>
								<CheckCircle className="h-4 w-4 mr-1" />
								<T
									id="inventory.batchDetail.complete"
									defaultMessage="Complete Batch"
								/>
							</Button>
						)}
						<Button
							variant="ghost"
							size="sm"
							className="text-destructive hover:text-destructive"
							onClick={() => setCancelDialogOpen(true)}
						>
							<XCircle className="h-4 w-4 mr-1" />
							<T id="common.cancel" defaultMessage="Cancel" />
						</Button>
					</div>
				)}
			</div>

			{/* Two-column layout */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left 2/3 */}
				<div className="lg:col-span-2 space-y-6">
					{/* Materials */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">
								<T
									id="inventory.batchDetail.materials.title"
									defaultMessage="Materials Consumed"
								/>
							</CardTitle>
							<p className="text-sm text-muted-foreground">
								<T
									id="inventory.batchDetail.materials.description"
									defaultMessage="Raw materials used in this production run."
								/>
							</p>
						</CardHeader>
						<CardContent>
							{batch.materials.length === 0 ? (
								<p className="text-sm text-muted-foreground py-4 text-center">
									<T
										id="inventory.batchDetail.materials.empty"
										defaultMessage="No materials added."
									/>
								</p>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>
												<T id="inventory.batchDetail.materials.table.material" defaultMessage="Material" />
											</TableHead>
											<TableHead className="text-right">
												<T id="inventory.batchDetail.materials.table.planned" defaultMessage="Planned" />
											</TableHead>
											<TableHead className="text-right">
												<T id="inventory.batchDetail.materials.table.actual" defaultMessage="Actual" />
											</TableHead>
											<TableHead className="text-right">
												<T id="inventory.batchDetail.materials.table.unitCost" defaultMessage="Unit Cost" />
											</TableHead>
											<TableHead className="text-right">
												<T id="inventory.batchDetail.materials.table.totalCost" defaultMessage="Total Cost" />
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{batch.materials.map((m) => (
											<TableRow key={m.id}>
												<TableCell className="font-medium">{m.material_name}</TableCell>
												<TableCell className="text-right tabular-nums text-muted-foreground">
													{m.planned_quantity ?? t("inventory.common.empty", "—")}
												</TableCell>
												<TableCell className="text-right tabular-nums">
													{Number(m.actual_quantity).toLocaleString(
														locale === "bn" ? "bn-BD" : "en-IN",
													)}
												</TableCell>
												<TableCell className="text-right tabular-nums">
													{m.actual_unit_cost
														? `৳${parseFloat(m.actual_unit_cost).toLocaleString(
															locale === "bn" ? "bn-BD" : "en-IN",
															{
																minimumFractionDigits: 2,
																maximumFractionDigits: 2,
															},
														)}`
														: t("inventory.common.empty", "—")}
												</TableCell>
												<TableCell className="text-right tabular-nums font-medium">
													{formatAmount(m.total_cost)}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>

					{/* Outputs */}
					<Card>
						<CardHeader>
							<CardTitle className="text-base">
								<T
									id="inventory.batchDetail.outputs.title"
									defaultMessage="Finished Outputs"
								/>
							</CardTitle>
							<p className="text-sm text-muted-foreground">
								<T
									id="inventory.batchDetail.outputs.description"
									defaultMessage="Products produced in this batch."
								/>
							</p>
						</CardHeader>
						<CardContent>
							{batch.outputs.length === 0 ? (
								<p className="text-sm text-muted-foreground py-4 text-center">
									<T
										id="inventory.batchDetail.outputs.empty"
										defaultMessage="No outputs added."
									/>
								</p>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>
												<T id="inventory.batchDetail.outputs.table.product" defaultMessage="Product" />
											</TableHead>
											<TableHead>
												<T id="inventory.batchDetail.outputs.table.variant" defaultMessage="Variant" />
											</TableHead>
											<TableHead className="text-right">
												<T id="inventory.batchDetail.outputs.table.quantity" defaultMessage="Quantity" />
											</TableHead>
											<TableHead className="text-right">
												<T id="inventory.batchDetail.outputs.table.unitCost" defaultMessage="Unit Cost" />
											</TableHead>
											<TableHead className="text-right">
												<T id="inventory.batchDetail.outputs.table.totalCost" defaultMessage="Total Cost" />
											</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{batch.outputs.map((o) => (
											<TableRow key={o.id}>
												<TableCell className="font-medium">{o.product_name}</TableCell>
												<TableCell className="text-muted-foreground">{o.variant_name}</TableCell>
												<TableCell className="text-right tabular-nums">
													{Number(o.quantity).toLocaleString(
														locale === "bn" ? "bn-BD" : "en-IN",
													)}
												</TableCell>
												<TableCell className="text-right tabular-nums">
													{o.unit_cost
														? `৳${parseFloat(o.unit_cost).toLocaleString(
															locale === "bn" ? "bn-BD" : "en-IN",
															{
																minimumFractionDigits: 2,
																maximumFractionDigits: 2,
															},
														)}`
														: t("inventory.common.empty", "—")}
												</TableCell>
												<TableCell className="text-right tabular-nums font-medium">
													{formatAmount(o.total_cost)}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</CardContent>
					</Card>

					{/* Costing summary */}
					{batch.costing && (
						<Card>
							<CardHeader>
								<CardTitle className="text-base">
									<T id="inventory.batchDetail.costing.title" defaultMessage="Batch Costing" />
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span className="text-muted-foreground">
										<T
											id="inventory.batchDetail.costing.totalMaterialCost"
											defaultMessage="Total Material Cost"
										/>
									</span>
									<span className="font-medium tabular-nums">
										{formatAmount(batch.costing.total_material_cost)}
									</span>
								</div>
								<div className="flex justify-between border-t pt-2">
									<span className="font-semibold">
										<T
											id="inventory.batchDetail.costing.totalOutputCost"
											defaultMessage="Total Output Cost"
										/>
									</span>
									<span className="font-semibold tabular-nums">
										{formatAmount(batch.costing.total_output_cost)}
									</span>
								</div>
							</CardContent>
						</Card>
					)}
				</div>

				{/* Right 1/3 */}
				<div className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="text-base">
								<T id="inventory.batchDetail.info.title" defaultMessage="Batch Details" />
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">
									<T id="inventory.batchDetail.info.status" defaultMessage="Status" />
								</span>
								<BatchStatusBadge status={batch.status} labels={statusLabels} />
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">
									<T id="inventory.batchDetail.info.started" defaultMessage="Started" />
								</span>
								<span>{formatDate(batch.started_at)}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">
									<T id="inventory.batchDetail.info.completed" defaultMessage="Completed" />
								</span>
								<span>{formatDate(batch.completed_at)}</span>
							</div>
							{batch.notes && (
								<div className="pt-2 border-t">
									<p className="text-muted-foreground mb-1">
										<T id="inventory.batchDetail.info.notes" defaultMessage="Notes" />
									</p>
									<p>{batch.notes}</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Complete confirmation */}
			<AppConfirmDialog
				open={completeDialogOpen}
				title={t("inventory.batchDetail.completeDialog.title", "Complete Production Batch")}
				description={t(
					"inventory.batchDetail.completeDialog.description",
					"Completing this batch will reduce raw material stock by the amounts listed, add the produced quantity to each variant's stock, and update variant cost prices. This cannot be undone.",
				)}
				confirmButtonText={t("inventory.batchDetail.completeDialog.confirm", "Confirm & Complete")}
				cancelButtonText={t("common.cancel", "Cancel")}
				confirmButtonVariant="default"
				onConfirm={handleComplete}
				onCancel={() => setCompleteDialogOpen(false)}
			/>

			{/* Cancel confirmation */}
			<AppConfirmDialog
				open={cancelDialogOpen}
				title={t("inventory.batchDetail.cancelDialog.title", "Cancel Batch")}
				description={t(
					"inventory.batchDetail.cancelDialog.description",
					'Are you sure you want to cancel batch "{code}"? This cannot be undone.',
					{ code: batch.code },
				)}
				confirmButtonText={t("inventory.batchDetail.cancelDialog.confirm", "Cancel Batch")}
				cancelButtonText={t("inventory.batchDetail.cancelDialog.keep", "Keep Batch")}
				confirmButtonVariant="destructive"
				onConfirm={handleCancel}
				onCancel={() => setCancelDialogOpen(false)}
			/>
		</div>
	);
}
