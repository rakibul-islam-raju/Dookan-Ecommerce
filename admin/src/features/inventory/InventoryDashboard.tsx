import { AppTable, type Column } from "@/components/common/AppTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocale } from "@/i18n/locale-context";
import { T } from "@/i18n/translate";
import { useT } from "@/i18n/use-t";
import { useAuthStore } from "@/store/useAuthStore";
import { getBatches, getMaterials, getVariantTransactions, type IVariantStockTransaction } from "@/lib/api/inventory";
import { useQuery } from "@tanstack/react-query";
import {
	ChevronRight,
	Factory,
	Layers,
	PackagePlus,
} from "lucide-react";
import { Link } from "react-router-dom";

function StockTransactionTypeBadge({
	type,
	label,
}: {
	type: IVariantStockTransaction["transaction_type"];
	label: string;
}) {
	const map: Record<IVariantStockTransaction["transaction_type"], { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
		purchase_receipt: { label, variant: "default" },
		production_receipt: { label, variant: "default" },
		adjustment_in: { label, variant: "outline" },
		adjustment_out: { label, variant: "secondary" },
		order_sale: { label, variant: "destructive" },
		order_cancel_return: { label, variant: "secondary" },
	};
	const { label: badgeLabel, variant } = map[type] ?? { label: type, variant: "outline" };
	return <Badge variant={variant}>{badgeLabel}</Badge>;
}

export function InventoryDashboard() {
	const t = useT();
	const { locale } = useLocale();
	const { vendorContext } = useAuthStore();
	const inventoryMode = vendorContext?.inventory_mode;
	const isManufacturing = inventoryMode === "manufacturing";

	const { data: materialsData } = useQuery({
		...getMaterials({ limit: 200, offset: 0 }),
		enabled: isManufacturing,
	});

	const { data: batchesData } = useQuery({
		...getBatches({ limit: 200, offset: 0 }),
		enabled: isManufacturing,
	});

	const { data: stockTxData, isLoading: txLoading } = useQuery(
		getVariantTransactions(undefined, { limit: 10, offset: 0 }),
	);

	const materials = materialsData?.results || [];
	const lowStockCount = materials.filter(
		(m) => parseFloat(m.current_quantity) <= parseFloat(m.reorder_level),
	).length;

	const activeBatches = (batchesData?.results || []).filter(
		(b) => b.status === "draft" || b.status === "in_progress",
	).length;

	const formatDate = (date: string) =>
		new Date(date).toLocaleDateString(locale === "bn" ? "bn-BD" : "en-GB", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});

	const transactionTypeLabels: Record<IVariantStockTransaction["transaction_type"], string> = {
		purchase_receipt: t("inventory.transactionType.purchaseReceipt", "Purchase"),
		production_receipt: t("inventory.transactionType.productionReceipt", "Production"),
		adjustment_in: t("inventory.transactionType.adjustmentIn", "Adj. In"),
		adjustment_out: t("inventory.transactionType.adjustmentOut", "Adj. Out"),
		order_sale: t("inventory.transactionType.orderSale", "Sale"),
		order_cancel_return: t("inventory.transactionType.orderCancelReturn", "Return"),
	};

	const inventoryModeLabel =
		inventoryMode === "manufacturing"
			? t("inventory.mode.manufacturing", "manufacturing")
			: inventoryMode === "trading"
				? t("inventory.mode.trading", "trading")
				: undefined;

	const recentTxColumns: Column<IVariantStockTransaction>[] = [
		{
			key: "created_at",
			header: t("inventory.dashboard.table.date", "Date"),
			render: (tx) => <span className="text-sm whitespace-nowrap">{formatDate(tx.created_at)}</span>,
		},
		{
			key: "product",
			header: t("inventory.dashboard.table.product", "Product"),
			render: (tx) => <span className="text-sm font-medium">{tx.product_name}</span>,
		},
		{
			key: "variant",
			header: t("inventory.dashboard.table.variant", "Variant"),
			render: (tx) => <span className="text-sm text-muted-foreground">{tx.variant_name}</span>,
		},
		{
			key: "type",
			header: t("inventory.dashboard.table.type", "Type"),
			render: (tx) => (
				<StockTransactionTypeBadge
					type={tx.transaction_type}
					label={transactionTypeLabels[tx.transaction_type] ?? tx.transaction_type}
				/>
			),
		},
		{
			key: "quantity_change",
			header: t("inventory.dashboard.table.change", "Change"),
			render: (tx) => (
				<span
					className={`tabular-nums font-medium ${
						tx.quantity_change >= 0 ? "text-green-600" : "text-destructive"
					}`}
				>
					{tx.quantity_change >= 0
						? `+${tx.quantity_change.toLocaleString(locale === "bn" ? "bn-BD" : "en-IN")}`
						: tx.quantity_change.toLocaleString(locale === "bn" ? "bn-BD" : "en-IN")}
				</span>
			),
			className: "text-right",
		},
		{
			key: "balance_after",
			header: t("inventory.dashboard.table.balance", "Balance"),
			render: (tx) => (
				<span className="tabular-nums">
					{tx.balance_after.toLocaleString(locale === "bn" ? "bn-BD" : "en-IN")}
				</span>
			),
			className: "text-right",
		},
	];

	const modeBadge = inventoryMode ? (
		<Badge variant="outline" className="text-sm font-normal ml-2 capitalize">
			{t("inventory.dashboard.modeBadge", "{mode} mode", { mode: inventoryModeLabel })}
		</Badge>
	) : null;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<div className="flex items-center gap-2">
					<h1 className="text-3xl font-bold tracking-tight">
						<T id="inventory.dashboard.title" defaultMessage="Inventory" />
					</h1>
					{modeBadge}
				</div>
				<p className="text-muted-foreground mt-1">
					{isManufacturing ? (
						<T
							id="inventory.dashboard.description.manufacturing"
							defaultMessage="Track your stock levels, purchases, materials, and production runs."
						/>
					) : (
						<T
							id="inventory.dashboard.description.trading"
							defaultMessage="Track your stock levels, purchases, and receipts."
						/>
					)}
					{inventoryMode && (
						<span className="ml-1">
							{t(
								"inventory.dashboard.currentMode",
								"Your current mode is {mode}, configured by your administrator.",
								{ mode: inventoryModeLabel ?? inventoryMode },
							)}
						</span>
					)}
				</p>
			</div>

			{/* Mode-specific stats + navigation */}
			{isManufacturing ? (
				<>
					{/* Stats */}
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-medium text-muted-foreground">
									<T
										id="inventory.dashboard.summary.totalMaterials"
										defaultMessage="Total Materials"
									/>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-2xl font-bold">
									{typeof materialsData?.count === "number"
										? materialsData.count.toLocaleString(
											locale === "bn" ? "bn-BD" : "en-IN",
										)
										: "—"}
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-medium text-muted-foreground">
									<T
										id="inventory.dashboard.summary.lowStockMaterials"
										defaultMessage="Low Stock Materials"
									/>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className={`text-2xl font-bold ${lowStockCount > 0 ? "text-orange-500" : ""}`}>
									{lowStockCount.toLocaleString(locale === "bn" ? "bn-BD" : "en-IN")}
								</p>
								{lowStockCount > 0 && (
									<p className="text-xs text-orange-500 mt-1">
										<T
											id="inventory.dashboard.summary.needsRestocking"
											defaultMessage="Needs restocking"
										/>
									</p>
								)}
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-medium text-muted-foreground">
									<T
										id="inventory.dashboard.summary.activeBatches"
										defaultMessage="Active Batches"
									/>
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-2xl font-bold">
									{activeBatches.toLocaleString(locale === "bn" ? "bn-BD" : "en-IN")}
								</p>
								<p className="text-xs text-muted-foreground mt-1">
									<T
										id="inventory.dashboard.summary.draftOrInProgress"
										defaultMessage="Draft or in progress"
									/>
								</p>
							</CardContent>
						</Card>
					</div>

					{/* Navigation cards */}
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<Card className="hover:border-primary/50 transition-colors">
							<CardHeader className="pb-3">
								<div className="flex items-center gap-2">
									<Layers className="h-5 w-5 text-primary" />
									<CardTitle className="text-base">
										<T
											id="inventory.dashboard.cards.materials.title"
											defaultMessage="Raw Materials"
										/>
									</CardTitle>
								</div>
								<CardDescription>
									<T
										id="inventory.dashboard.cards.materials.description"
										defaultMessage="Manage materials, track stock levels, record purchases, and set reorder alerts."
									/>
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Button asChild variant="outline" size="sm" className="w-full">
									<Link to="/inventory/materials">
										<T
											id="inventory.dashboard.cards.materials.cta"
											defaultMessage="Go to Materials"
										/>{" "}
										<ChevronRight className="h-4 w-4 ml-1" />
									</Link>
								</Button>
							</CardContent>
						</Card>

						<Card className="hover:border-primary/50 transition-colors">
							<CardHeader className="pb-3">
								<div className="flex items-center gap-2">
									<Factory className="h-5 w-5 text-primary" />
									<CardTitle className="text-base">
										<T
											id="inventory.dashboard.cards.batches.title"
											defaultMessage="Production Batches"
										/>
									</CardTitle>
								</div>
								<CardDescription>
									<T
										id="inventory.dashboard.cards.batches.description"
										defaultMessage="Create and manage production batches. Track materials consumed and finished goods produced."
									/>
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Button asChild variant="outline" size="sm" className="w-full">
									<Link to="/inventory/batches">
										<T
											id="inventory.dashboard.cards.batches.cta"
											defaultMessage="Go to Batches"
										/>{" "}
										<ChevronRight className="h-4 w-4 ml-1" />
									</Link>
								</Button>
							</CardContent>
						</Card>
					</div>
				</>
			) : (
				<>
					{/* Trading navigation */}
					<Card className="hover:border-primary/50 transition-colors">
						<CardHeader className="pb-3">
							<div className="flex items-center gap-2">
								<PackagePlus className="h-5 w-5 text-primary" />
								<CardTitle className="text-base">
									<T
										id="inventory.dashboard.cards.receipts.title"
										defaultMessage="Finished Goods Receipts"
									/>
								</CardTitle>
							</div>
							<CardDescription>
								<T
									id="inventory.dashboard.cards.receipts.description"
									defaultMessage="Record stock received from suppliers. Each receipt automatically updates the variant's available stock and cost price."
								/>
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button asChild variant="outline" size="sm">
								<Link to="/inventory/receipts">
									<T
										id="inventory.dashboard.cards.receipts.cta"
										defaultMessage="Go to Receipts"
									/>{" "}
									<ChevronRight className="h-4 w-4 ml-1" />
								</Link>
							</Button>
						</CardContent>
					</Card>
				</>
			)}

			{/* Recent stock activity */}
			<div>
				<div className="flex items-center justify-between mb-3">
					<h2 className="text-lg font-semibold">
						<T
							id="inventory.dashboard.recent.title"
							defaultMessage="Recent Stock Activity"
						/>
					</h2>
				</div>
				<AppTable
					data={stockTxData?.results || []}
					columns={recentTxColumns}
					isLoading={txLoading}
					rowKey={(tx) => tx.id}
					emptyMessage={t(
						"inventory.dashboard.recent.empty",
						"No stock movements yet.",
					)}
				/>
			</div>
		</div>
	);
}
