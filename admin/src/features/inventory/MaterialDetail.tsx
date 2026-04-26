import { AppTable, type Column } from "@/components/common/AppTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { pagination } from "@/config";
import {
	getMaterial,
	getMaterialTransactions,
	type IMaterial,
	type IMaterialTransaction,
} from "@/lib/api/inventory";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MaterialForm } from "./components/MaterialForm";
import { MaterialTransactionFormModal } from "./components/MaterialTransactionFormModal";

function TransactionTypeBadge({ type }: { type: IMaterialTransaction["transaction_type"] }) {
	const map: Record<
		IMaterialTransaction["transaction_type"],
		{ label: string; variant: "default" | "secondary" | "destructive" | "outline" }
	> = {
		purchase: { label: "Purchase", variant: "default" },
		adjustment_in: { label: "Adj. In", variant: "outline" },
		adjustment_out: { label: "Adj. Out", variant: "secondary" },
		issue_to_batch: { label: "To Batch", variant: "secondary" },
		return_from_batch: { label: "From Batch", variant: "outline" },
	};
	const { label, variant } = map[type] ?? { label: type, variant: "outline" };
	return <Badge variant={variant}>{label}</Badge>;
}

export function MaterialDetail() {
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
		new Date(date).toLocaleDateString("en-GB", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});

	const txColumns: Column<IMaterialTransaction>[] = [
		{
			key: "created_at",
			header: "Date",
			render: (tx) => <span className="text-sm whitespace-nowrap">{formatDate(tx.created_at)}</span>,
		},
		{
			key: "transaction_type",
			header: "Type",
			render: (tx) => <TransactionTypeBadge type={tx.transaction_type} />,
		},
		{
			key: "quantity_change",
			header: "Quantity",
			render: (tx) => (
				<span
					className={`tabular-nums font-medium ${
						parseFloat(tx.quantity_change) >= 0 ? "text-green-600" : "text-destructive"
					}`}
				>
					{parseFloat(tx.quantity_change) >= 0
						? `+${parseFloat(tx.quantity_change).toLocaleString()}`
						: parseFloat(tx.quantity_change).toLocaleString()}{" "}
					{material?.unit}
				</span>
			),
			className: "text-right",
		},
		{
			key: "unit_cost",
			header: "Unit Cost",
			render: (tx) => (
				<span className="tabular-nums text-sm">
					{tx.unit_cost ? `৳${parseFloat(tx.unit_cost).toFixed(2)}` : "—"}
				</span>
			),
			className: "text-right",
		},
		{
			key: "balance_after",
			header: "Balance After",
			render: (tx) => (
				<span className="tabular-nums font-medium">
					{parseFloat(tx.balance_after).toLocaleString()} {material?.unit}
				</span>
			),
			className: "text-right",
		},
		{
			key: "note",
			header: "Note",
			render: (tx) => (
				<span className="text-sm text-muted-foreground truncate max-w-[180px] block">
					{tx.note || "—"}
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
				Material not found.
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" onClick={() => navigate("/inventory/materials")}>
					<ArrowLeft className="h-4 w-4 mr-1" />
					Raw Materials
				</Button>
			</div>

			<div className="flex items-center gap-3">
				<h1 className="text-3xl font-bold tracking-tight">{material.name}</h1>
				{material.is_active ? (
					<Badge variant="default">Active</Badge>
				) : (
					<Badge variant="secondary">Inactive</Badge>
				)}
				{isLowStock && (
					<Badge variant="outline" className="text-orange-500 border-orange-300">
						Low Stock
					</Badge>
				)}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left: Tabs */}
				<div className="lg:col-span-2">
					<Tabs defaultValue="details">
						<TabsList>
							<TabsTrigger value="details">Details</TabsTrigger>
							<TabsTrigger value="transactions">Stock Transactions</TabsTrigger>
						</TabsList>

						<TabsContent value="details" className="mt-4 space-y-4">
							{/* Current stock stats */}
							<div className="grid grid-cols-3 gap-4">
								<Card>
									<CardHeader className="pb-1">
										<CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
											Current Stock
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p
											className={`text-xl font-bold tabular-nums ${
												isLowStock ? "text-orange-500" : ""
											}`}
										>
											{parseFloat(material.current_quantity).toLocaleString()}{" "}
											{material.unit}
										</p>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className="pb-1">
										<CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
											Avg Unit Cost
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-xl font-bold tabular-nums">
											৳{parseFloat(material.weighted_average_cost).toFixed(2)}
										</p>
									</CardContent>
								</Card>
								<Card>
									<CardHeader className="pb-1">
										<CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
											Total Value
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-xl font-bold tabular-nums">
											৳
											{(
												parseFloat(material.current_quantity) *
												parseFloat(material.weighted_average_cost)
											).toFixed(2)}
										</p>
									</CardContent>
								</Card>
							</div>

							<MaterialForm handleClose={() => {}} material={material} mode="edit" />
						</TabsContent>

						<TabsContent value="transactions" className="mt-4">
							<div className="flex items-center justify-between mb-4">
								<p className="text-sm text-muted-foreground">
									Complete history of all stock movements for this material.
								</p>
								<Button size="sm" onClick={() => setIsTxModalOpen(true)}>
									<Plus className="h-4 w-4 mr-1" />
									Record Transaction
								</Button>
							</div>

							<AppTable
								data={transactions?.results || []}
								columns={txColumns}
								isLoading={txLoading}
								rowKey={(tx) => tx.id}
								emptyMessage="No transactions yet. Record the first stock movement above."
								pagination={{ currentPage: txPage, totalPages: txTotalPages, onPageChange: setTxPage }}
							/>
						</TabsContent>
					</Tabs>
				</div>

				{/* Right: Info card */}
				<div>
					<Card>
						<CardHeader>
							<CardTitle className="text-base">Material Info</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3 text-sm">
							<div className="flex justify-between">
								<span className="text-muted-foreground">SKU</span>
								<span className="font-mono">{material.sku}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Unit</span>
								<span>{material.unit}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Category</span>
								<span>{material.category_name || "—"}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Reorder Level</span>
								<span className="tabular-nums">
									{parseFloat(material.reorder_level).toLocaleString()} {material.unit}
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-muted-foreground">Last Updated</span>
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
