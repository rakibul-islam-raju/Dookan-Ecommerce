import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AppTable, type Column } from "@/components/common/AppTable";
import { getExpenses, getExpenseSummary, type IExpense } from "@/lib/api/expenses";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, BookOpen, ChevronRight, Plus, Receipt, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { useState } from "react";
import { ExpenseFormModal } from "./components/ExpenseFormModal";

const today = new Date();
const monthStart = format(startOfMonth(today), "yyyy-MM-dd");
const monthEnd = format(endOfMonth(today), "yyyy-MM-dd");

const formatAmount = (amount: string) =>
	`৳${parseFloat(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

export function ExpenseDashboard() {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const { data: summary, isLoading: summaryLoading } = useQuery(
		getExpenseSummary(monthStart, monthEnd),
	);

	const { data: recentExpenses, isLoading: expensesLoading } = useQuery(
		getExpenses({ limit: 10, page: 1 }),
	);

	const formatDate = (date: string) =>
		new Date(date).toLocaleDateString("en-GB", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		});

	const recentColumns: Column<IExpense>[] = [
		{
			key: "incurred_on",
			header: "Date",
			render: (e) => <span className="text-sm whitespace-nowrap">{formatDate(e.incurred_on)}</span>,
		},
		{
			key: "category",
			header: "Category",
			render: (e) => <span className="text-sm font-medium">{e.category_name}</span>,
		},
		{
			key: "amount",
			header: "Amount",
			render: (e) => (
				<span className="font-medium tabular-nums">{formatAmount(e.amount)}</span>
			),
		},
		{
			key: "reference",
			header: "Reference",
			render: (e) => (
				<span className="text-sm text-muted-foreground">{e.reference || "—"}</span>
			),
		},
		{
			key: "linked_to",
			header: "Linked To",
			render: (e) =>
				e.batch_code ? (
					<span className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
						{e.batch_code}
					</span>
				) : (
					<span className="text-muted-foreground">—</span>
				),
		},
	];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
					<p className="text-muted-foreground mt-1">
						Track all business costs — purchases, labour, transport, advertising,
						and more. Link expenses to production batches for accurate costing.
					</p>
				</div>
				<Button onClick={() => setIsModalOpen(true)}>
					<Plus className="h-4 w-4 mr-2" />
					Add Expense
				</Button>
			</div>

			{/* Month summary cards */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							This Month — Total
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold tabular-nums">
							{summaryLoading ? "—" : formatAmount(summary?.total_expense || "0")}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Batch-Linked
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold tabular-nums">
							{summaryLoading ? "—" : formatAmount(summary?.batch_linked_total || "0")}
						</p>
						<p className="text-xs text-muted-foreground mt-1">
							In production cost
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							General
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold tabular-nums">
							{summaryLoading ? "—" : formatAmount(summary?.general_total || "0")}
						</p>
						<p className="text-xs text-muted-foreground mt-1">
							Not linked to a batch
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Navigation cards */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<Card className="hover:border-primary/50 transition-colors">
					<CardHeader className="pb-3">
						<div className="flex items-center gap-2">
							<BookOpen className="h-5 w-5 text-primary" />
							<CardTitle className="text-base">All Expenses</CardTitle>
						</div>
						<CardDescription>
							Record and review all expense entries with full filter and search.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button asChild variant="outline" size="sm" className="w-full">
							<Link to="/expenses/entries">
								View Expenses <ChevronRight className="h-4 w-4 ml-1" />
							</Link>
						</Button>
					</CardContent>
				</Card>

				<Card className="hover:border-primary/50 transition-colors">
					<CardHeader className="pb-3">
						<div className="flex items-center gap-2">
							<Tag className="h-5 w-5 text-primary" />
							<CardTitle className="text-base">Categories</CardTitle>
						</div>
						<CardDescription>
							Manage custom expense categories to organise your entries.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button asChild variant="outline" size="sm" className="w-full">
							<Link to="/expenses/categories">
								Manage Categories <ChevronRight className="h-4 w-4 ml-1" />
							</Link>
						</Button>
					</CardContent>
				</Card>

				<Card className="hover:border-primary/50 transition-colors">
					<CardHeader className="pb-3">
						<div className="flex items-center gap-2">
							<BarChart3 className="h-5 w-5 text-primary" />
							<CardTitle className="text-base">Reports</CardTitle>
						</div>
						<CardDescription>
							View total expenses by category and custom date range.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button asChild variant="outline" size="sm" className="w-full">
							<Link to="/expenses/reports">
								View Reports <ChevronRight className="h-4 w-4 ml-1" />
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>

			{/* Recent expenses */}
			<div>
				<div className="flex items-center justify-between mb-3">
					<h2 className="text-lg font-semibold">Recent Expenses</h2>
					<Button asChild variant="ghost" size="sm">
						<Link to="/expenses/entries">
							View all <ChevronRight className="h-4 w-4 ml-1" />
						</Link>
					</Button>
				</div>
				<AppTable
					data={recentExpenses?.results || []}
					columns={recentColumns}
					isLoading={expensesLoading}
					rowKey={(e) => e.id}
					emptyMessage="No expenses recorded yet."
				/>
			</div>

			<ExpenseFormModal
				open={isModalOpen}
				onOpenChange={setIsModalOpen}
				mode="create"
			/>
		</div>
	);
}
