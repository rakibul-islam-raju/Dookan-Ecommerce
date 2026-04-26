import { AppTable, type Column } from "@/components/common/AppTable";
import { Button } from "@/components/ui/button";
import { pagination } from "@/config";
import { getReceipts, type IFinishedGoodsReceipt } from "@/lib/api/inventory";
import { useQuery } from "@tanstack/react-query";
import { PackagePlus, Plus } from "lucide-react";
import { useState } from "react";
import { ReceiptFormModal } from "./components/ReceiptFormModal";

export function ReceiptList() {
	const [currentPage, setCurrentPage] = useState(1);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const { data, isLoading, error } = useQuery(
		getReceipts({
			limit: pagination.limit,
			offset: (currentPage - 1) * pagination.limit,
		}),
	);

	const formatAmount = (amount: string) =>
		`৳${parseFloat(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

	const formatDate = (date: string) =>
		new Date(date).toLocaleDateString("en-GB", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});

	const columns: Column<IFinishedGoodsReceipt>[] = [
		{
			key: "received_at",
			header: "Date",
			render: (r) => <span className="text-sm whitespace-nowrap">{formatDate(r.received_at)}</span>,
		},
		{
			key: "product",
			header: "Product",
			render: (r) => <span className="font-medium text-sm">{r.product_name}</span>,
		},
		{
			key: "variant",
			header: "Variant",
			render: (r) => <span className="text-sm text-muted-foreground">{r.variant_name}</span>,
		},
		{
			key: "supplier",
			header: "Supplier",
			render: (r) => (
				<span className="text-sm">{r.supplier_name || "—"}</span>
			),
		},
		{
			key: "quantity",
			header: "Qty",
			render: (r) => <span className="tabular-nums font-medium">{r.quantity}</span>,
			className: "text-right",
		},
		{
			key: "unit_cost",
			header: "Unit Cost",
			render: (r) => <span className="tabular-nums text-sm">{formatAmount(r.unit_cost)}</span>,
			className: "text-right",
		},
		{
			key: "total_cost",
			header: "Total Cost",
			render: (r) => <span className="tabular-nums font-medium">{formatAmount(r.total_cost)}</span>,
			className: "text-right",
		},
		{
			key: "reference",
			header: "Reference",
			render: (r) => (
				<span className="text-sm text-muted-foreground font-mono">{r.reference || "—"}</span>
			),
		},
	];

	const totalPages = data ? Math.ceil(data.count / pagination.limit) : 0;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Finished Goods Receipts</h1>
					<p className="text-muted-foreground mt-1">
						Record stock received from suppliers. Each receipt automatically updates
						the variant's available stock and cost price.
					</p>
				</div>
				<Button onClick={() => setIsModalOpen(true)}>
					<Plus className="h-4 w-4 mr-2" />
					Record Receipt
				</Button>
			</div>

			<AppTable
				data={data?.results || []}
				columns={columns}
				isLoading={isLoading}
				rowKey={(r) => r.id}
				emptyMessage={
					error
						? "Error loading receipts"
						: "No receipts recorded yet. Record your first goods receipt to add stock to a product variant."
				}
				pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }}
			/>

			<ReceiptFormModal open={isModalOpen} onOpenChange={setIsModalOpen} />
		</div>
	);
}
