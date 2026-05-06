import { AppTable, type Column } from "@/components/common/AppTable";
import { AppConfirmDialog } from "@/components/@app/AppConfirmDialog";
import { FilterDrawer } from "@/components/common/FilterDrawer";
import { SearchBar } from "@/components/common/SearchBar";
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
import { useFilterParams } from "@/hooks/useFilterParams";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
	getExpenses,
	useDeleteExpense,
	type IExpense,
} from "@/lib/api/expenses";
import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import type { IExpenseFilter } from "@/@types/Expense";
import { ExpenseFormModal } from "./components/ExpenseFormModal";
import { ExpenseFilterForm } from "./components/ExpenseFilterForm";

const initialParams: IExpenseFilter = { limit: pagination.limit, page: 1 };

export function ExpenseList() {
	const t = useT();
	const { locale } = useLocale();
	const { params, handleChangeParams, resetParams } = useFilterParams({
		initialParams,
	});
	const [searchQuery, setSearchQuery] = useState("");
	const debouncedSearch = useDebouncedValue(searchQuery, 400);
	const [currentPage, setCurrentPage] = useState(1);
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalMode, setModalMode] = useState<"create" | "edit">("create");
	const [selectedExpense, setSelectedExpense] = useState<IExpense | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [expenseToDelete, setExpenseToDelete] = useState<IExpense | null>(null);

	const { data, isLoading, error } = useQuery(
		getExpenses({
			...params,
			search: debouncedSearch || undefined,
			page: currentPage,
		}),
	);

	const deleteMutation = useDeleteExpense();

	const handleEdit = (expense: IExpense) => {
		setSelectedExpense(expense);
		setModalMode("edit");
		setIsModalOpen(true);
	};

	const handleDeleteClick = (expense: IExpense) => {
		setExpenseToDelete(expense);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!expenseToDelete) return;
		try {
			await deleteMutation.mutateAsync(expenseToDelete.id);
			toast.success(t("expenses.list.deleteSuccess", "Expense deleted"));
		} catch {
			toast.error(t("expenses.list.deleteFailed", "Failed to delete expense"));
		} finally {
			setDeleteDialogOpen(false);
			setExpenseToDelete(null);
		}
	};

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

	const columns: Column<IExpense>[] = [
		{
			key: "incurred_on",
			header: t("expenses.list.table.date", "Date"),
			render: (expense) => (
				<span className="text-sm whitespace-nowrap">
					{formatDate(expense.incurred_on)}
				</span>
			),
		},
		{
			key: "category",
			header: t("expenses.list.table.category", "Category"),
			render: (expense) => (
				<span className="font-medium text-sm">{expense.category_name}</span>
			),
		},
		{
			key: "amount",
			header: t("expenses.list.table.amount", "Amount"),
			render: (expense) => (
				<span className="font-medium tabular-nums">
					{formatAmount(expense.amount)}
				</span>
			),
		},
		{
			key: "reference",
			header: t("expenses.list.table.reference", "Reference"),
			render: (expense) => (
				<span className="text-sm text-muted-foreground">
					{expense.reference || "—"}
				</span>
			),
		},
		{
			key: "linked_to",
			header: t("expenses.list.table.linkedTo", "Linked To"),
			render: (expense) => {
				if (expense.production_batch && expense.batch_code) {
					return (
						<span className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
							{expense.batch_code}
						</span>
					);
				}
				if (expense.product_variant && expense.variant_name) {
					return (
						<span className="text-xs text-muted-foreground">
							{expense.variant_name}
						</span>
					);
				}
				return <span className="text-muted-foreground">—</span>;
			},
		},
		{
			key: "notes",
			header: t("expenses.list.table.notes", "Notes"),
			render: (expense) => (
				<span className="text-sm text-muted-foreground truncate max-w-[200px] block">
					{expense.notes || "—"}
				</span>
			),
		},
		{
			key: "actions",
			header: "",
			render: (expense) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>
							<T id="expenses.list.actions.label" defaultMessage="Actions" />
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => handleEdit(expense)}>
							<Pencil className="h-4 w-4 mr-2" />
							<T id="expenses.list.actions.edit" defaultMessage="Edit" />
						</DropdownMenuItem>
						<DropdownMenuItem
							className="text-destructive"
							onClick={() => handleDeleteClick(expense)}
						>
							<Trash2 className="h-4 w-4 mr-2" />
							<T id="expenses.list.actions.delete" defaultMessage="Delete" />
						</DropdownMenuItem>
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
						<T id="expenses.list.title" defaultMessage="Expense Entries" />
					</h1>
					<p className="text-muted-foreground mt-1">
						<T
							id="expenses.list.description"
							defaultMessage="All recorded expenses. Filter by category or date range to review costs for a specific period."
						/>
					</p>
				</div>
				<Button
					onClick={() => {
						setModalMode("create");
						setSelectedExpense(null);
						setIsModalOpen(true);
					}}
				>
					<Plus className="h-4 w-4 mr-2" />
					<T id="expenses.dashboard.addExpense" defaultMessage="Add Expense" />
				</Button>
			</div>

			<div className="flex items-center gap-4">
				<SearchBar
					value={searchQuery}
					onChange={setSearchQuery}
					placeholder={t("expenses.list.searchPlaceholder", "Search by reference or notes...")}
					className="flex-1"
				/>
				<FilterDrawer open={isFilterOpen} onOpenChange={setIsFilterOpen}>
					<ExpenseFilterForm
						initialFilter={params}
						onFilter={(filter) => {
							handleChangeParams({ ...filter, page: 1 });
							setCurrentPage(1);
							setIsFilterOpen(false);
						}}
						onReset={() => {
							resetParams();
							setSearchQuery("");
							setCurrentPage(1);
							setIsFilterOpen(false);
						}}
					/>
				</FilterDrawer>
			</div>

			<AppTable
				data={data?.results || []}
				columns={columns}
				isLoading={isLoading}
				rowKey={(expense) => expense.id}
				emptyMessage={
					error
						? t("expenses.list.error", "Error loading expenses")
						: searchQuery
							? t("expenses.list.empty.search", 'No expenses found for "{query}"', {
									query: searchQuery,
								})
							: t(
									"expenses.list.empty.default",
									"No expenses recorded yet. Start tracking your business costs.",
								)
				}
				pagination={{ currentPage, totalPages, onPageChange: setCurrentPage }}
			/>

			<ExpenseFormModal
				open={isModalOpen}
				onOpenChange={setIsModalOpen}
				expense={selectedExpense}
				mode={modalMode}
			/>

			<AppConfirmDialog
				open={deleteDialogOpen}
				title={t("expenses.list.deleteTitle", "Delete Expense")}
				description={t(
					"expenses.list.deleteDescription",
					"This expense entry will be removed permanently. This action cannot be undone.",
				)}
				confirmButtonText={t("expenses.list.actions.delete", "Delete")}
				cancelButtonText={t("common.cancel", "Cancel")}
				confirmButtonVariant="destructive"
				onConfirm={handleConfirmDelete}
				onCancel={() => setDeleteDialogOpen(false)}
			/>
		</div>
	);
}
