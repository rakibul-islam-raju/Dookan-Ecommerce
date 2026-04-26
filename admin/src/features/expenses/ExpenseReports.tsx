import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getExpenseSummary } from "@/lib/api/expenses";
import { useQuery } from "@tanstack/react-query";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from "date-fns";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseISO } from "date-fns";

const formatAmount = (amount: string) =>
	`৳${parseFloat(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

const today = new Date();

function QuickFilterButton({
	label,
	onClick,
	active,
}: {
	label: string;
	onClick: () => void;
	active: boolean;
}) {
	return (
		<Button
			type="button"
			size="sm"
			variant={active ? "default" : "outline"}
			onClick={onClick}
		>
			{label}
		</Button>
	);
}

function DatePickerButton({
	value,
	onChange,
	placeholder,
}: {
	value: string;
	onChange: (val: string) => void;
	placeholder: string;
}) {
	const selected = value ? parseISO(value) : undefined;

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="outline"
					className={cn(
						"w-[160px] justify-start text-left font-normal",
						!value && "text-muted-foreground",
					)}
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{selected ? format(selected, "dd MMM yyyy") : placeholder}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					captionLayout="dropdown"
					selected={selected}
					onSelect={(date) => onChange(date ? format(date, "yyyy-MM-dd") : "")}
					autoFocus
				/>
			</PopoverContent>
		</Popover>
	);
}

type QuickFilter = "this_month" | "last_month" | "this_year" | "custom";

export function ExpenseReports() {
	const [startDate, setStartDate] = useState(() => format(startOfMonth(today), "yyyy-MM-dd"));
	const [endDate, setEndDate] = useState(() => format(endOfMonth(today), "yyyy-MM-dd"));
	const [activeQuickFilter, setActiveQuickFilter] = useState<QuickFilter>("this_month");

	const { data, isLoading } = useQuery(getExpenseSummary(startDate, endDate));

	const applyQuickFilter = (filter: QuickFilter) => {
		setActiveQuickFilter(filter);
		if (filter === "this_month") {
			setStartDate(format(startOfMonth(today), "yyyy-MM-dd"));
			setEndDate(format(endOfMonth(today), "yyyy-MM-dd"));
		} else if (filter === "last_month") {
			const lastMonth = subMonths(today, 1);
			setStartDate(format(startOfMonth(lastMonth), "yyyy-MM-dd"));
			setEndDate(format(endOfMonth(lastMonth), "yyyy-MM-dd"));
		} else if (filter === "this_year") {
			setStartDate(format(startOfYear(today), "yyyy-MM-dd"));
			setEndDate(format(endOfYear(today), "yyyy-MM-dd"));
		}
	};

	const totalExpense = parseFloat(data?.total_expense || "0");
	const batchLinked = parseFloat(data?.batch_linked_total || "0");
	const general = parseFloat(data?.general_total || "0");

	const byCategory = data?.by_category || [];
	const sortedCategories = [...byCategory].sort(
		(a, b) => parseFloat(b.total) - parseFloat(a.total),
	);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Expense Reports</h1>
				<p className="text-muted-foreground mt-1">
					Summarise your expenses for any time period. Select a date range to
					see totals by category.
				</p>
			</div>

			{/* Date range controls */}
			<div className="flex flex-wrap items-center gap-3">
				<div className="flex items-center gap-2">
					<DatePickerButton
						value={startDate}
						onChange={(val) => {
							setStartDate(val);
							setActiveQuickFilter("custom");
						}}
						placeholder="Start date"
					/>
					<span className="text-muted-foreground text-sm">to</span>
					<DatePickerButton
						value={endDate}
						onChange={(val) => {
							setEndDate(val);
							setActiveQuickFilter("custom");
						}}
						placeholder="End date"
					/>
				</div>

				<div className="flex items-center gap-2 border-l pl-3">
					<QuickFilterButton
						label="This Month"
						active={activeQuickFilter === "this_month"}
						onClick={() => applyQuickFilter("this_month")}
					/>
					<QuickFilterButton
						label="Last Month"
						active={activeQuickFilter === "last_month"}
						onClick={() => applyQuickFilter("last_month")}
					/>
					<QuickFilterButton
						label="This Year"
						active={activeQuickFilter === "this_year"}
						onClick={() => applyQuickFilter("this_year")}
					/>
				</div>
			</div>

			{/* Summary cards */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Total Expenses
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold tabular-nums">
							{isLoading ? "—" : formatAmount(data?.total_expense || "0")}
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
							{isLoading ? "—" : formatAmount(data?.batch_linked_total || "0")}
						</p>
						<p className="text-xs text-muted-foreground mt-1">
							Included in production cost calculations
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							General Expenses
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold tabular-nums">
							{isLoading ? "—" : formatAmount(data?.general_total || "0")}
						</p>
						<p className="text-xs text-muted-foreground mt-1">
							Not linked to any production batch
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Category breakdown */}
			<Card>
				<CardHeader>
					<CardTitle>Breakdown by Category</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="space-y-2">
							{[...Array(4)].map((_, i) => (
								<div key={i} className="h-10 bg-muted animate-pulse rounded" />
							))}
						</div>
					) : sortedCategories.length === 0 ? (
						<p className="text-center text-muted-foreground py-8 text-sm">
							No expenses found for the selected period.
						</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Category</TableHead>
									<TableHead className="text-right">Amount (৳)</TableHead>
									<TableHead className="text-right w-[100px]">% of Total</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{sortedCategories.map((row) => {
									const pct =
										totalExpense > 0
											? ((parseFloat(row.total) / totalExpense) * 100).toFixed(1)
											: "0.0";
									return (
										<TableRow key={row.category_id}>
											<TableCell className="font-medium">
												{row.category_name}
											</TableCell>
											<TableCell className="text-right tabular-nums">
												{formatAmount(row.total)}
											</TableCell>
											<TableCell className="text-right text-muted-foreground">
												{pct}%
											</TableCell>
										</TableRow>
									);
								})}
								<TableRow className="border-t-2 font-bold">
									<TableCell>Total</TableCell>
									<TableCell className="text-right tabular-nums">
										{formatAmount(data?.total_expense || "0")}
									</TableCell>
									<TableCell className="text-right">100%</TableCell>
								</TableRow>
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
