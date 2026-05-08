import { AppTable, type Column } from "@/components/common/AppTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { pagination } from "@/config";
import { useLocale } from "@/i18n/locale-context";
import { T } from "@/i18n/translate";
import { useT } from "@/i18n/use-t";
import {
	getMaterial,
	getMaterialTransactions,
	type IMaterialTransaction,
} from "@/lib/api/inventory";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MaterialForm } from "./components/MaterialForm";
import { MaterialTransactionFormModal } from "./components/MaterialTransactionFormModal";

function TransactionTypeBadge({
	type,
	label,
}: {
	type: IMaterialTransaction["transaction_type"];
	label: string;
}) {
	const map: Record<
		IMaterialTransaction["transaction_type"],
		{ label: string; variant: "default" | "secondary" | "destructive" | "outline" }
	> = {
		purchase: { label, variant: "default" },
		adjustment_in: { label, variant: "outline" },
		adjustment_out: { label, variant: "secondary" },
		issue_to_batch: { label, variant: "secondary" },
		return_from_batch: { label, variant: "outline" },
	};
	const { label: badgeLabel, variant } = map[type] ?? { label: type, variant: "outline" };
	return <Badge variant={variant}>{badgeLabel}</Badge>;
}

export function MaterialDetail() {
	const t = useT();
	const { locale } = useLocale();
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [txPage, setTxPage] = useState(1);
	const [isTxModalOpen, setIsTxModalOpen] = useState(false);

	const { data: material, isLoading } = useQuery(getMaterial(id!));
	const { data: transactions, isLoading: txLoading } = useQuery(
		getMaterialTransactions(id, {
			limit: pagination.limit,
			offset: (txPage - 1) * pagination.limit,
		}),
	);

	const isLowStock = material
		? parseFloat(material.current_quantity) <= parseFloat(material.reorder_level)
		: false;

	const formatDate = (date: string) =>
		new Date(date).toLocaleDateString(locale === "bn" ? "bn-BD" : "en-GB", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});

	const transactionTypeLabels: Record<IMaterialTransaction["transaction_type"], string> = {
		purchase: t("inventory.materialTransactionType.purchase", "Purchase"),
		adjustment_in: t("inventory.materialTransactionType.adjustmentIn", "Adj. In"),
		adjustment_out: t("inventory.materialTransactionType.adjustmentOut", "Adj. Out"),
		issue_to_batch: t("inventory.materialTransactionType.issueToBatch", "To Batch"),
		return_from_batch: t("inventory.materialTransactionType.returnFromBatch", "From Batch"),
	};

	const txColumns: Column<IMaterialTransaction>[] = [
		{
			key: "created_at",
			header: t("inventory.materialDetail.table.date", "Date"),
			render: (tx) => <span className="text-sm whitespace-nowrap">{formatDate(tx.created_at)}</span>,
		},
		{
			key: "transaction_type",
			header: t("inventory.materialDetail.table.type", "Type"),
			render: (tx) => (
				<TransactionTypeBadge
					type={tx.transaction_type}
					label={transactionTypeLabels[tx.transaction_type] ?? tx.transaction_type}
				/>
			),
		},
		{
			key: "quantity_change",
			header: t("inventory.materialDetail.table.quantity", "Quantity"),
			render: (tx) => (
				<span
					className={`tabular-nums font-medium ${
						parseFloat(tx.quantity_change) >= 0 ? "text-green-600" : "text-destructive"
					}`}
				>
					{parseFloat(tx.quantity_change) >= 0
						? `+${parseFloat(tx.quantity_change).toLocaleString(locale === "bn" ? "bn-BD" : "en-IN")}`
						: parseFloat(tx.quantity_change).toLocaleString(locale === "bn" ? "bn-BD" : "en-IN")}{" "}
					{material?.unit}
				</span>
			),
			className: "text-right",
		},
		{
			key: "unit_cost",
			header: t("inventory.materialDetail.table.unitCost", "Unit Cost"),
			render: (tx) => (
				<span className="tabular-nums text-sm">
					{tx.unit_cost
						? `৳${parseFloat(tx.unit_cost).toLocaleString(locale === "bn" ? "bn-BD" : "en-IN", {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
						})}`
						: t("inventory.common.empty", "—")}
				</span>
			),
			className: "text-right",
		},
		{
			key: "balance_after",
			header: t("inventory.materialDetail.table.balanceAfter", "Balance After"),
			render: (tx) => (
				<span className="tabular-nums font-medium">
					{parseFloat(tx.balance_after).toLocaleString(locale === "bn" ? "bn-BD" : "en-IN")} {material?.unit}
				</span>
			),
			className: "text-right",
		},
		{
			key: "note",
			header: t("inventory.materialDetail.table.note", "Note"),
			render: (tx) => (
				<span className="text-sm text-muted-foreground truncate max-w-[180px] block">
					{tx.note || t("inventory.common.empty", "—")}
				</span>
			),
		},
	];

	const txTotalPages = transactions ? Math.ceil(transactions.count / pagination.limit) : 0;

	if (isLoading) {
		return (
			<div className="space-y-4">
				<div className="h-8 w-48 bg-muted animate-pulse rounded" />
				<div className="h-64 bg-muted animate-pulse rounded" />
			</div>
		);
	}

	if (!material) {
		return (
			<div className="text-center py-12 text-muted-foreground">
				<T id="inventory.materialDetail.notFound" defaultMessage="Material not found." />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" onClick={() => navigate("/inventory/materials")}>
					<ArrowLeft className="h-4 w-4 mr-1" />
					<T id="inventory.materials.title" defaultMessage="Raw Materials" />
				</Button>
			</div>

			<div className="flex items-center gap-3">
				<h1 className="text-3xl font-bold tracking-tight">{material.name}</h1>
				{material.is_active ? (
					<Badge variant="default">
						<T id="inventory.status.active" defaultMessage="Active" />
					</Badge>
				) : (
					<Badge variant="secondary">
						<T id="inventory.status.inactive" defaultMessage="Inactive" />
					</Badge>
				)}
				{isLowStock && (
					<Badge variant="outline" className="text-orange-500 border-orange-300">
						<T id="inventory.materials.lowStock" defaultMessage="Low Stock" />
					</Badge>
				)}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left: Tabs */}
				<div className="lg:col-span-2">
					<Tabs defaultValue="details">
						<TabsList>
							<TabsTrigger value="details">
								<T id="inventory.materialDetail.tabs.details" defaultMessage="Details" />
							</TabsTrigger>
							<TabsTrigger value="transactions">
								<T
									id="inventory.materialDetail.tabs.transactions"
									defaultMessage="Stock Transactions"
								/>
							</TabsTrigger>
						</TabsList>

						<TabsContent value="details" className="mt-4 space-y-4">
							{/* Current stock stats */}
							<div className="grid grid-cols-3 gap-4">
								<Card>
									<CardHeader className="pb-1">
										<CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
											<T
												id="inventory.materialDetail.stats.currentStock"
												defaultMessage="Current Stock"
											/>
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p
											className={`text-xl font-bold tabular-nums ${
												isLowStock ? "text-orange-500" : ""
											}`}
										>
											{parseFloat(material.current_quantity).toLocaleString(
												locale === "bn" ? "bn-BD" : "en-IN",
											)}{" "}
											{material.unit}
										</p>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className="pb-1">
										<CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
											<T
												id="inventory.materialDetail.stats.avgUnitCost"
												defaultMessage="Avg Unit Cost"
											/>
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-xl font-bold tabular-nums">
											{`৳${parseFloat(material.weighted_average_cost).toLocaleString(
												locale === "bn" ? "bn-BD" : "en-IN",
												{
													minimumFractionDigits: 2,
													maximumFractionDigits: 2,
												},
											)}`}
										</p>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className="pb-1">
										<CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
											<T
												id="inventory.materialDetail.stats.totalValue"
												defaultMessage="Total Value"
											/>
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-xl font-bold tabular-nums">
											{`৳${(
												parseFloat(material.current_quantity) *
												parseFloat(material.weighted_average_cost)
											).toLocaleString(locale === "bn" ? "bn-BD" : "en-IN", {
												minimumFractionDigits: 2,
												maximumFractionDigits: 2,
											})}`}
										</p>
									</CardContent>
								</Card>
							</div>

							<MaterialForm handleClose={() => {}} material={material} mode="edit" />
						</TabsContent>

						<TabsContent value="transactions" className="mt-4">
							<div className="flex items-center justify-between mb-4">
								<p className="text-sm text-muted-foreground">
									<T
										id="inventory.materialDetail.transactions.description"
										defaultMessage="Complete history of all stock movements for this material."
									/>
								</p>
								<Button size="sm" onClick={() => setIsTxModalOpen(true)}>
									<Plus className="h-4 w-4 mr-1" />
									<T
										id="inventory.materialDetail.transactions.record"
										defaultMessage="Record Transaction"
									/>
								</Button>
							</div>

							<AppTable
								data={transactions?.results || []}
								columns={txColumns}
								isLoading={txLoading}
								rowKey={(tx) => tx.id}
								emptyMessage={t(
									"inventory.materialDetail.transactions.empty",
									"No transactions yet. Record the first stock movement above.",
								)}
								pagination={{ currentPage: txPage, totalPages: txTotalPages, onPageChange: setTxPage }}
							/>
						</TabsContent>
					</Tabs>
				</div>

				{/* Right: Info card */}
				<div>
					<Card>
						<CardHeader>
							<CardTitle className="text-base">
								<T id="inventory.materialDetail.info.title" defaultMessage="Material Info" />
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">
									<T id="inventory.materialDetail.info.sku" defaultMessage="SKU" />
								</span>
								<span className="font-mono">{material.sku}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">
									<T id="inventory.materialDetail.info.unit" defaultMessage="Unit" />
								</span>
								<span>{material.unit}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">
									<T id="inventory.materialDetail.info.category" defaultMessage="Category" />
								</span>
								<span>{material.category_name || t("inventory.common.empty", "—")}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">
									<T
										id="inventory.materialDetail.info.reorderLevel"
										defaultMessage="Reorder Level"
									/>
								</span>
								<span className="tabular-nums">
									{parseFloat(material.reorder_level).toLocaleString(
										locale === "bn" ? "bn-BD" : "en-IN",
									)}{" "}
									{material.unit}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">
									<T
										id="inventory.materialDetail.info.lastUpdated"
										defaultMessage="Last Updated"
									/>
								</span>
								<span>{formatDate(material.updated_at)}</span>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			<MaterialTransactionFormModal
				open={isTxModalOpen}
				onOpenChange={setIsTxModalOpen}
				materialId={material.id}
				materialName={material.name}
				unit={material.unit}
			/>
		</div>
	);
}
