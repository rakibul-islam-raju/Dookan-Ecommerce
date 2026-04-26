import { AppTable, type Column } from "@/components/common/AppTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";
import { getBatches, getMaterials, getVariantTransactions, type IVariantStockTransaction } from "@/lib/api/inventory";
import { useQuery } from "@tanstack/react-query";
import {
	Boxes,
	ChevronRight,
	Factory,
	Layers,
	PackagePlus,
} from "lucide-react";
import { Link } from "react-router-dom";

function StockTransactionTypeBadge({ type }: { type: IVariantStockTransaction["transaction_type"] }) {
	const map: Record<IVariantStockTransaction["transaction_type"], { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
		purchase_receipt: { label: "Purchase", variant: "default" },
		production_receipt: { label: "Production", variant: "default" },
		adjustment_in: { label: "Adj. In", variant: "outline" },
		adjustment_out: { label: "Adj. Out", variant: "secondary" },
		order_sale: { label: "Sale", variant: "destructive" },
		order_cancel_return: { label: "Return", variant: "secondary" },
	};
	const { label, variant } = map[type] ?? { label: type, variant: "outline" };
	return <Badge variant={variant}>{label}</Badge>;
}

export function InventoryDashboard() {
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
		new Date(date).toLocaleDateString("en-GB", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});

	const recentTxColumns: Column<IVariantStockTransaction>[] = [
		{
			key: "created_at",
			header: "Date",
			render: (tx) => <span className="text-sm whitespace-nowrap">{formatDate(tx.created_at)}</span>,
		},
		{
			key: "product",
			header: "Product",
			render: (tx) => <span className="text-sm font-medium">{tx.product_name}</span>,
		},
		{
			key: "variant",
			header: "Variant",
			render: (tx) => <span className="text-sm text-muted-foreground">{tx.variant_name}</span>,
		},
		{
			key: "type",
			header: "Type",
			render: (tx) => <StockTransactionTypeBadge type={tx.transaction_type} />,
		},
		{
			key: "quantity_change",
			header: "Change",
			render: (tx) => (
				<span
					className={`tabular-nums font-medium ${
						tx.quantity_change >= 0 ? "text-green-600" : "text-destructive"
					}`}
				>
					{tx.quantity_change >= 0 ? `+${tx.quantity_change}` : tx.quantity_change}
				</span>
			),
			className: "text-right",
		},
		{
			key: "balance_after",
			header: "Balance",
			render: (tx) => <span className="tabular-nums">{tx.balance_after}</span>,
			className: "text-right",
		},
	];

	const modeBadge = inventoryMode ? (
		<Badge variant="outline" className="text-sm font-normal ml-2 capitalize">
			{inventoryMode} mode
		</Badge>
	) : null;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<div className="flex items-center gap-2">
					<h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
					{modeBadge}
				</div>
				<p className="text-muted-foreground mt-1">
					Track your stock levels, purchases
					{isManufacturing ? ", materials, and production runs" : " and receipts"}.
					{inventoryMode && (
						<span className="ml-1">
							Your current mode is <strong>{inventoryMode}</strong> — configured
							by your administrator.
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
									Total Materials
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-2xl font-bold">{materialsData?.count ?? "—"}</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-medium text-muted-foreground">
									Low Stock Materials
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className={`text-2xl font-bold ${lowStockCount > 0 ? "text-orange-500" : ""}`}>
									{lowStockCount}
								</p>
								{lowStockCount > 0 && (
									<p className="text-xs text-orange-500 mt-1">Needs restocking</p>
								)}
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-medium text-muted-foreground">
									Active Batches
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-2xl font-bold">{activeBatches}</p>
								<p className="text-xs text-muted-foreground mt-1">Draft or in progress</p>
							</CardContent>
						</Card>
					</div>

					{/* Navigation cards */}
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<Card className="hover:border-primary/50 transition-colors">
							<CardHeader className="pb-3">
								<div className="flex items-center gap-2">
									<Layers className="h-5 w-5 text-primary" />
									<CardTitle className="text-base">Raw Materials</CardTitle>
								</div>
								<CardDescription>
									Manage materials, track stock levels, record purchases,
									and set reorder alerts.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Button asChild variant="outline" size="sm" className="w-full">
									<Link to="/inventory/materials">
										Go to Materials <ChevronRight className="h-4 w-4 ml-1" />
									</Link>
								</Button>
							</CardContent>
						</Card>

						<Card className="hover:border-primary/50 transition-colors">
							<CardHeader className="pb-3">
								<div className="flex items-center gap-2">
									<Factory className="h-5 w-5 text-primary" />
									<CardTitle className="text-base">Production Batches</CardTitle>
								</div>
								<CardDescription>
									Create and manage production batches. Track materials consumed
									and finished goods produced.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Button asChild variant="outline" size="sm" className="w-full">
									<Link to="/inventory/batches">
										Go to Batches <ChevronRight className="h-4 w-4 ml-1" />
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
								<CardTitle className="text-base">Finished Goods Receipts</CardTitle>
							</div>
							<CardDescription>
								Record stock received from suppliers. Each receipt automatically
								updates the variant's available stock and cost price.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button asChild variant="outline" size="sm">
								<Link to="/inventory/receipts">
									Go to Receipts <ChevronRight className="h-4 w-4 ml-1" />
								</Link>
							</Button>
						</CardContent>
					</Card>
				</>
			)}

			{/* Recent stock activity */}
			<div>
				<div className="flex items-center justify-between mb-3">
					<h2 className="text-lg font-semibold">Recent Stock Activity</h2>
				</div>
				<AppTable
					data={stockTxData?.results || []}
					columns={recentTxColumns}
					isLoading={txLoading}
					rowKey={(tx) => tx.id}
					emptyMessage="No stock movements yet."
				/>
			</div>
		</div>
	);
}
