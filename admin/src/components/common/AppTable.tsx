/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Column<T> {
	key: string;
	header: string;
	render?: (item: T) => React.ReactNode;
	className?: string;
}

interface AppTableProps<T> {
	data: T[];
	columns: Column<T>[];
	isLoading?: boolean;
	emptyMessage?: string;
	pagination?: {
		currentPage: number;
		totalPages: number;
		onPageChange: (page: number) => void;
		pageSize?: number;
	};
	onRowClick?: (item: T) => void;
	rowClassName?: (item: T) => string;
}

export function AppTable<T extends Record<string, any>>({
	data,
	columns,
	isLoading = false,
	emptyMessage = "No data available",
	pagination,
	onRowClick,
	rowClassName,
}: AppTableProps<T>) {
	const renderCellContent = (item: T, column: Column<T>) => {
		if (column.render) {
			return column.render(item);
		}
		return item[column.key];
	};

	if (isLoading) {
		return (
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							{columns.map((column) => (
								<TableHead key={column.key} className={column.className}>
									{column.header}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{[...Array(5)].map((_, index) => (
							<TableRow key={index}>
								{columns.map((column) => (
									<TableCell key={column.key} className={column.className}>
										<div className="h-4 bg-muted animate-pulse rounded" />
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		);
	}

	if (!data || data.length === 0) {
		return (
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							{columns.map((column) => (
								<TableHead key={column.key} className={column.className}>
									{column.header}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						<TableRow>
							<TableCell
								colSpan={columns.length}
								className="h-24 text-center text-muted-foreground"
							>
								{emptyMessage}
							</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							{columns.map((column) => (
								<TableHead key={column.key} className={column.className}>
									{column.header}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.map((item, index) => (
							<TableRow
								key={index}
								onClick={() => onRowClick?.(item)}
								className={`${
									onRowClick ? "cursor-pointer hover:bg-muted/50" : ""
								} ${rowClassName ? rowClassName(item) : ""}`}
							>
								{columns.map((column) => (
									<TableCell key={column.key} className={column.className}>
										{renderCellContent(item, column)}
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{pagination && pagination.totalPages > 1 && (
				<div className="flex items-center justify-between">
					<p className="text-sm text-muted-foreground">
						Page {pagination.currentPage} of {pagination.totalPages}
					</p>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								pagination.onPageChange(pagination.currentPage - 1)
							}
							disabled={pagination.currentPage === 1}
						>
							<ChevronLeft className="h-4 w-4" />
							Previous
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() =>
								pagination.onPageChange(pagination.currentPage + 1)
							}
							disabled={pagination.currentPage === pagination.totalPages}
						>
							Next
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
