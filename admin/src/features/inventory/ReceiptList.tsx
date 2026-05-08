import { AppTable, type Column } from "@/components/common/AppTable";
import { Button } from "@/components/ui/button";
import { pagination } from "@/config";
import { useLocale } from "@/i18n/locale-context";
import { T } from "@/i18n/translate";
import { useT } from "@/i18n/use-t";
import { getReceipts, type IFinishedGoodsReceipt } from "@/lib/api/inventory";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { ReceiptFormModal } from "./components/ReceiptFormModal";

export function ReceiptList() {
	const t = useT();
	const { locale } = useLocale();
	const [currentPage, setCurrentPage] = useState(1);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const { data, isLoading, error } = useQuery(
		getReceipts({
			limit: pagination.limit,
			offset: (currentPage - 1) * pagination.limit,
		}),
	);

	const formatAmount = (amount: string) =>
		`৳${parseFloat(amount).toLocaleString(locale === "bn" ? "bn-BD" : "en-IN", {
			minimumFractionDigits: 2,
		})}`;

	const formatDate = (date: string) =>
		new Date(date).toLocaleDateString(locale === "bn" ? "bn-BD" : "en-GB", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});

	const columns: Column<IFinishedGoodsReceipt>[] = [
		{
			key: "received_at",
			header: t("inventory.receipts.table.date", "Date"),
			render: (r) => <span className="text-sm whitespace-nowrap">{formatDate(r.received_at)}</span>,
		},
		{
			key: "product",
			header: t("inventory.receipts.table.product", "Product"),
			render: (r) => <span className="font-medium text-sm">{r.product_name}</span>,
		},
		{
			key: "variant",
			header: t("inventory.receipts.table.variant", "Variant"),
			render: (r) => <span className="text-sm text-muted-foreground">{r.variant_name}</span>,
		},
		{
			key: "supplier",
			header: t("inventory.receipts.table.supplier", "Supplier"),
			render: (r) => (
				<span className="text-sm">{r.supplier_name || t("inventory.common.empty", "—")}</span>
			),
		},
		{
			key: "quantity",
			header: t("inventory.receipts.table.quantity", "Qty"),
			render: (r) => (
				<span className="tabular-nums font-medium">
					{r.quantity.toLocaleString(locale === "bn" ? "bn-BD" : "en-IN")}
				</span>
			),
			className: "text-right",
		},
		{
			key: "unit_cost",
			header: t("inventory.receipts.table.unitCost", "Unit Cost"),
			render: (r) => <span className="tabular-nums text-sm">{formatAmount(r.unit_cost)}</span>,
			className: "text-right",
		},
		{
			key: "total_cost",
			header: t("inventory.receipts.table.totalCost", "Total Cost"),
			render: (r) => <span className="tabular-nums font-medium">{formatAmount(r.total_cost)}</span>,
			className: "text-right",
		},
		{
			key: "reference",
			header: t("inventory.receipts.table.reference", "Reference"),
			render: (r) => (
				<span className="text-sm text-muted-foreground font-mono">
					{r.reference || t("inventory.common.empty", "—")}
				</span>
			),
		},
	];

	const totalPages = data ? Math.ceil(data.count / pagination.limit) : 0;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						<T
							id="inventory.receipts.title"
							defaultMessage="Finished Goods Receipts"
						/>
					</h1>
					<p className="text-muted-foreground mt-1">
						<T
							id="inventory.receipts.description"
							defaultMessage="Record stock received from suppliers. Each receipt automatically updates the variant's available stock and cost price."
						/>
					</p>
				</div>
				<Button onClick={() => setIsModalOpen(true)}>
					<Plus className="h-4 w-4 mr-2" />
					<T id="inventory.receipts.add" defaultMessage="Record Receipt" />
				</Button>
			</div>

			<AppTable
				data={data?.results || []}
				columns={columns}
				isLoading={isLoading}
				rowKey={(r) => r.id}
				emptyMessage={
					error
						? t("inventory.receipts.error", "Error loading receipts")
						: t(
							"inventory.receipts.empty",
							"No receipts recorded yet. Record your first goods receipt to add stock to a product variant.",
						)
				}
				pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }}
			/>

			<ReceiptFormModal open={isModalOpen} onOpenChange={setIsModalOpen} />
		</div>
	);
}
