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
import { getBatch, useCompleteBatch, useUpdateBatch } from "@/lib/api/inventory";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import type { IProductionBatch } from "@/lib/api/inventory";

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

const formatAmount = (amount: string | null) =>
	amount ? `৳${parseFloat(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "—";

const formatDate = (date: string | null) =>
	date
		? new Date(date).toLocaleDateString("en-GB", {
				day: "2-digit",
				month: "short",
				year: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			})
		: "—";

export function BatchDetail() {
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
			toast.success("Batch completed. Stock and costs updated.");
		} catch {
			toast.error("Failed to complete batch. Check materials and outputs.");
		} finally {
			setCompleteDialogOpen(false);
		}
	};

	const handleCancel = async () => {
		try {
			await updateMutation.mutateAsync({ id: id!, data: { status: "cancelled" } });
			toast.success("Batch cancelled");
		} catch {
			toast.error("Failed to cancel batch");
		} finally {
			setCancelDialogOpen(false);
		}
	};

	const handleMarkInProgress = async () => {
		try {
			await updateMutation.mutateAsync({ id: id!, data: { status: "in_progress" } });
			toast.success("Batch marked as In Progress");
		} catch {
			toast.error("Failed to update batch status");
		}
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
		return <div className="text-center py-12 text-muted-foreground">Batch not found.</div>;
	}

	const isEditable = batch.status === "draft" || batch.status === "in_progress";
	const canComplete = batch.status === "in_progress";
	const canMarkInProgress = batch.status === "draft";

	return (
		<div className="space-y-6">
			{/* Breadcrumb */}
			<Button variant="ghost" size="sm" onClick={() => navigate("/inventory/batches")}>
				<ArrowLeft className="h-4 w-4 mr-1" />
				Production Batches
			</Button>

			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<h1 className="text-3xl font-bold tracking-tight font-mono">
						{batch.code}
					</h1>
					<BatchStatusBadge status={batch.status} />
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
								Mark In Progress
							</Button>
						)}
						{canComplete && (
							<Button
								size="sm"
								onClick={() => setCompleteDialogOpen(true)}
								disabled={completeMutation.isPending}
							>
								<CheckCircle className="h-4 w-4 mr-1" />
								Complete Batch
							</Button>
						)}
						<Button
							variant="ghost"
							size="sm"
							className="text-destructive hover:text-destructive"
							onClick={() => setCancelDialogOpen(true)}
						>
							<XCircle className="h-4 w-4 mr-1" />
							Cancel
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
							<CardTitle className="text-base">Materials Consumed</CardTitle>
							<p className="text-sm text-muted-foreground">
								Raw materials used in this production run.
							</p>
						</CardHeader>
						<CardContent>
							{batch.materials.length === 0 ? (
								<p className="text-sm text-muted-foreground py-4 text-center">
									No materials added.
								</p>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Material</TableHead>
											<TableHead className="text-right">Planned</TableHead>
											<TableHead className="text-right">Actual</TableHead>
											<TableHead className="text-right">Unit Cost</TableHead>
											<TableHead className="text-right">Total Cost</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{batch.materials.map((m) => (
											<TableRow key={m.id}>
												<TableCell className="font-medium">{m.material_name}</TableCell>
												<TableCell className="text-right tabular-nums text-muted-foreground">
													{m.planned_quantity ?? "—"}
												</TableCell>
												<TableCell className="text-right tabular-nums">
													{m.actual_quantity}
												</TableCell>
												<TableCell className="text-right tabular-nums">
													{m.actual_unit_cost ? `৳${parseFloat(m.actual_unit_cost).toFixed(2)}` : "—"}
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
							<CardTitle className="text-base">Finished Outputs</CardTitle>
							<p className="text-sm text-muted-foreground">
								Products produced in this batch.
							</p>
						</CardHeader>
						<CardContent>
							{batch.outputs.length === 0 ? (
								<p className="text-sm text-muted-foreground py-4 text-center">
									No outputs added.
								</p>
							) : (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Product</TableHead>
											<TableHead>Variant</TableHead>
											<TableHead className="text-right">Quantity</TableHead>
											<TableHead className="text-right">Unit Cost</TableHead>
											<TableHead className="text-right">Total Cost</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{batch.outputs.map((o) => (
											<TableRow key={o.id}>
												<TableCell className="font-medium">{o.product_name}</TableCell>
												<TableCell className="text-muted-foreground">{o.variant_name}</TableCell>
												<TableCell className="text-right tabular-nums">{o.quantity}</TableCell>
												<TableCell className="text-right tabular-nums">
													{o.unit_cost ? `৳${parseFloat(o.unit_cost).toFixed(2)}` : "—"}
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
								<CardTitle className="text-base">Batch Costing</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span className="text-muted-foreground">Total Material Cost</span>
									<span className="font-medium tabular-nums">
										{formatAmount(batch.costing.total_material_cost)}
									</span>
								</div>
								<div className="flex justify-between border-t pt-2">
									<span className="font-semibold">Total Output Cost</span>
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
							<CardTitle className="text-base">Batch Details</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">Status</span>
								<BatchStatusBadge status={batch.status} />
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Started</span>
								<span>{formatDate(batch.started_at)}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Completed</span>
								<span>{formatDate(batch.completed_at)}</span>
							</div>
							{batch.notes && (
								<div className="pt-2 border-t">
									<p className="text-muted-foreground mb-1">Notes</p>
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
				title="Complete Production Batch"
				description="Completing this batch will reduce raw material stock by the amounts listed, add the produced quantity to each variant's stock, and update variant cost prices. This cannot be undone."
				confirmButtonText="Confirm & Complete"
				cancelButtonText="Cancel"
				confirmButtonVariant="default"
				onConfirm={handleComplete}
				onCancel={() => setCompleteDialogOpen(false)}
			/>

			{/* Cancel confirmation */}
			<AppConfirmDialog
				open={cancelDialogOpen}
				title="Cancel Batch"
				description={`Are you sure you want to cancel batch "${batch.code}"? This cannot be undone.`}
				confirmButtonText="Cancel Batch"
				cancelButtonText="Keep Batch"
				confirmButtonVariant="destructive"
				onConfirm={handleCancel}
				onCancel={() => setCancelDialogOpen(false)}
			/>
		</div>
	);
}
